import { ref, onMounted, onUnmounted } from 'vue';
import { api } from '../api';

const syncStatus = ref('idle'); // 'idle' | 'syncing' | 'success' | 'error'
const lastSyncTime = ref(null);
const lastMessage = ref('ระบบพร้อมซิงก์คลาวด์อัตโนมัติ');
const isSyncing = ref(false);

let pollInterval = null;

export function useCloudSync() {
  const fetchStatus = async () => {
    try {
      const res = await api.getCloudSyncStatus();
      if (res.success && res.data) {
        syncStatus.value = res.data.status || 'idle';
        lastSyncTime.value = res.data.lastSyncTime || null;
        lastMessage.value = res.data.lastMessage || '';
      }
    } catch (err) {
      console.warn('Could not fetch cloud sync status:', err);
    }
  };

  const triggerSync = async (message = 'Manual Sync from UI') => {
    try {
      isSyncing.value = true;
      syncStatus.value = 'syncing';
      lastMessage.value = 'กำลังอัปโหลดข้อมูลขึ้นคลาวด์...';
      const res = await api.triggerCloudSync({ message });
      if (res.success && res.data) {
        syncStatus.value = res.data.status;
        lastSyncTime.value = res.data.lastSyncTime;
        lastMessage.value = res.data.lastMessage;
      }
      return { success: true, message: lastMessage.value };
    } catch (err) {
      syncStatus.value = 'error';
      lastMessage.value = 'การซิงก์ขัดข้อง: ' + err.message;
      return { success: false, error: err.message };
    } finally {
      isSyncing.value = false;
    }
  };

  const startPolling = (intervalMs = 20000) => {
    fetchStatus();
    if (!pollInterval) {
      pollInterval = setInterval(fetchStatus, intervalMs);
    }
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  return {
    syncStatus,
    lastSyncTime,
    lastMessage,
    isSyncing,
    fetchStatus,
    triggerSync,
    startPolling,
    stopPolling
  };
}
