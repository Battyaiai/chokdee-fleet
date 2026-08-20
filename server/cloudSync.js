import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DB_FILE = path.join(__dirname, 'data', 'db.json');

let syncState = {
  status: 'idle', // 'idle' | 'syncing' | 'success' | 'error'
  lastSyncTime: new Date().toISOString(),
  lastMessage: 'ระบบพร้อมซิงก์ข้อมูลขึ้นคลาวด์อัตโนมัติ',
  lastError: null,
  syncCount: 0,
  repository: 'https://github.com/Battyaiai/chokdee-fleet.git'
};

let syncTimeout = null;
let isSyncInProgress = false;
let pendingSync = false;

export const cloudSync = {
  getStatus() {
    return { ...syncState };
  },

  // Called automatically whenever saveDB() runs
  triggerAutoSync(delayMs = 1500) {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(() => {
      this.syncNow('Auto-sync: บันทึกข้อมูลระบบโชคดีค้าข้าว');
    }, delayMs);
  },

  async syncNow(commitMessage = 'Sync fleet data to cloud') {
    if (isSyncInProgress) {
      pendingSync = true;
      return syncState;
    }

    isSyncInProgress = true;
    syncState.status = 'syncing';
    syncState.lastMessage = 'กำลังอัปโหลดข้อมูลขึ้นคลาวด์ (GitHub)...';

    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    const fullMessage = `${commitMessage} (${timestamp})`;

    try {
      // 1. Try local Git push first (ideal when running locally or on server with git repo)
      await executeGitSync(fullMessage);
      syncState.status = 'success';
      syncState.lastSyncTime = new Date().toISOString();
      syncState.lastMessage = `ซิงก์ขึ้นคลาวด์ GitHub เรียบร้อยแล้ว (${timestamp})`;
      syncState.lastError = null;
      syncState.syncCount += 1;
      console.log(`[CloudSync] Success: ${syncState.lastMessage}`);
    } catch (gitErr) {
      console.warn(`[CloudSync] Git sync note: ${gitErr.message}`);
      
      // 2. If Git command fails, check if GitHub API Token is provided in env
      const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      if (githubToken) {
        try {
          await executeGitHubApiSync(githubToken, fullMessage);
          syncState.status = 'success';
          syncState.lastSyncTime = new Date().toISOString();
          syncState.lastMessage = `ซิงก์ผ่าน GitHub API สำเร็จ (${timestamp})`;
          syncState.lastError = null;
          syncState.syncCount += 1;
          console.log(`[CloudSync] GitHub API Success: ${syncState.lastMessage}`);
        } catch (apiErr) {
          syncState.status = 'error';
          syncState.lastError = apiErr.message;
          syncState.lastMessage = `ซิงก์ไม่สำเร็จ: ${apiErr.message}`;
          console.error(`[CloudSync] GitHub API Error:`, apiErr);
        }
      } else {
        // If git said nothing to commit, treat as success/synced
        if (gitErr.message && gitErr.message.includes('nothing to commit')) {
          syncState.status = 'success';
          syncState.lastSyncTime = new Date().toISOString();
          syncState.lastMessage = `ข้อมูลเป็นปัจจุบันแล้ว (ไม่มีการเปลี่ยนแปลง)`;
          syncState.lastError = null;
        } else {
          syncState.status = 'error';
          syncState.lastError = gitErr.message;
          syncState.lastMessage = `การซิงก์: ${gitErr.message.slice(0, 120)}`;
        }
      }
    } finally {
      isSyncInProgress = false;
      if (pendingSync) {
        pendingSync = false;
        setTimeout(() => this.syncNow('Sync pending updates'), 1000);
      }
    }

    return syncState;
  }
};

function executeGitSync(message) {
  return new Promise((resolve, reject) => {
    // Stage db.json, commit and push to origin main
    const cmd = `git add server/data/db.json && git commit -m "${message.replace(/"/g, '\\"')}" && git push origin main`;
    exec(cmd, { cwd: ROOT_DIR }, (error, stdout, stderr) => {
      const combined = (stdout || '') + ' ' + (stderr || '');
      if (combined.includes('nothing to commit') || combined.includes('working tree clean')) {
        return resolve({ stdout: 'Already up to date', stderr });
      }
      if (error) {
        return reject(new Error(stderr || stdout || error.message));
      }
      resolve({ stdout, stderr });
    });
  });
}

async function executeGitHubApiSync(token, message) {
  const repo = process.env.GITHUB_REPOSITORY || 'Battyaiai/chokdee-fleet';
  const filePath = 'server/data/db.json';
  const content = fs.readFileSync(DB_FILE, 'utf-8');
  const base64Content = Buffer.from(content).toString('base64');

  // First fetch current file SHA
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Chokdee-Fleet-Sync'
    }
  });

  let sha = null;
  if (getRes.ok) {
    const fileInfo = await getRes.json();
    sha = fileInfo.sha;
  }

  // Update file on GitHub
  const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Chokdee-Fleet-Sync'
    },
    body: JSON.stringify({
      message: message,
      content: base64Content,
      sha: sha || undefined,
      branch: 'main'
    })
  });

  if (!putRes.ok) {
    const errBody = await putRes.text();
    throw new Error(`GitHub API HTTP ${putRes.status}: ${errBody}`);
  }

  return await putRes.json();
}
