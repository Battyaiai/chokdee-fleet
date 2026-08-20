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
  lastMessage: 'ระบบซิงก์คลาวด์อัตโนมัติพร้อมทำงาน',
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
  triggerAutoSync(delayMs = 1200) {
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
        const msg = (gitErr.message || '').toLowerCase();
        // If git said nothing to commit or up to date, treat as success/synced
        if (
          msg.includes('nothing to commit') || 
          msg.includes('no changes added to commit') ||
          msg.includes('everything up-to-date') ||
          msg.includes('already up to date') ||
          msg.includes('working tree clean')
        ) {
          syncState.status = 'success';
          syncState.lastSyncTime = new Date().toISOString();
          syncState.lastMessage = `ข้อมูลบนคลาวด์เป็นปัจจุบันแล้ว (${timestamp})`;
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
    // 1. Check if db.json has changes
    exec('git status --porcelain server/data/db.json', { cwd: ROOT_DIR }, (statusErr, statusOut) => {
      const hasDbChanges = Boolean(statusOut && statusOut.trim().length > 0);

      if (hasDbChanges) {
        const safeMsg = message.replace(/"/g, "'").replace(/[\r\n]+/g, ' ');
        const cmd = `git add server/data/db.json && git commit -m "${safeMsg}" && git push origin main`;
        exec(cmd, { cwd: ROOT_DIR }, (commitErr, stdout, stderr) => {
          const combined = `${stdout || ''} ${stderr || ''}`;
          if (commitErr) {
            if (
              combined.includes('nothing to commit') ||
              combined.includes('no changes added to commit') ||
              combined.includes('working tree clean') ||
              combined.includes('Everything up-to-date') ||
              combined.includes('Already up to date')
            ) {
              return resolve({ stdout: 'Synced / Up to date', stderr });
            }
            return reject(new Error(stderr || stdout || commitErr.message));
          }
          resolve({ stdout, stderr });
        });
      } else {
        // No uncommitted changes in db.json, just ensure pushed to origin main
        exec('git push origin main', { cwd: ROOT_DIR }, (pushErr, stdout, stderr) => {
          const combined = `${stdout || ''} ${stderr || ''}`;
          if (pushErr) {
            if (
              combined.includes('Everything up-to-date') ||
              combined.includes('Already up to date') ||
              combined.includes('up to date')
            ) {
              return resolve({ stdout: 'Everything up-to-date', stderr });
            }
            return reject(new Error(stderr || stdout || pushErr.message));
          }
          resolve({ stdout: 'Everything up-to-date', stderr });
        });
      }
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
