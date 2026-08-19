import { ref } from 'vue';
import { api } from '../api';

const STORAGE_KEY = 'chokdee_fleet_admin_auth';

// Shared reactive state across all components
const isAdmin = ref(localStorage.getItem(STORAGE_KEY) === 'true');
const isLoginModalOpen = ref(false);

export function useAuth() {
  const login = async (inputPin) => {
    if (!inputPin) return { success: false, message: 'กรุณากรอกรหัสผ่าน PIN' };
    
    try {
      const res = await api.adminLogin(inputPin.trim());
      if (res.success) {
        isAdmin.value = true;
        localStorage.setItem(STORAGE_KEY, 'true');
        isLoginModalOpen.value = false;
        return { success: true, message: 'เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จ' };
      }
      return { success: false, message: res.message || 'รหัสผ่าน PIN ไม่ถูกต้อง' };
    } catch (err) {
      // Fallback for default master pin
      if (inputPin.trim() === '8888') {
        isAdmin.value = true;
        localStorage.setItem(STORAGE_KEY, 'true');
        isLoginModalOpen.value = false;
        return { success: true, message: 'เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จ' };
      }
      return { success: false, message: 'รหัสผ่าน PIN ไม่ถูกต้อง (ค่าเริ่มต้น: 8888)' };
    }
  };

  const logout = () => {
    isAdmin.value = false;
    localStorage.removeItem(STORAGE_KEY);
  };

  const updatePin = async (oldPin, newPin) => {
    if (!oldPin) return { success: false, message: 'กรุณากรอกรหัส PIN เดิม' };
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
    }

    try {
      const res = await api.adminChangePin(oldPin.trim(), newPin.trim());
      return res;
    } catch (err) {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัส PIN' };
    }
  };

  return {
    isAdmin,
    isLoginModalOpen,
    login,
    logout,
    updatePin
  };
}
