import { ref, computed } from 'vue';
import { api } from '../api';

const STORAGE_KEY = 'chokdee_fleet_admin_auth';
const PIN_STORAGE_KEY = 'chokdee_fleet_admin_pin';

// Shared reactive state
const isAdmin = ref(localStorage.getItem(STORAGE_KEY) === 'true');
const adminPin = ref(localStorage.getItem(PIN_STORAGE_KEY) || '8888');
const isLoginModalOpen = ref(false);

export function useAuth() {
  const login = (inputPin) => {
    if (!inputPin) return { success: false, message: 'กรุณากรอกรหัสผ่าน PIN' };
    if (inputPin.trim() === adminPin.value.trim()) {
      isAdmin.value = true;
      localStorage.setItem(STORAGE_KEY, 'true');
      isLoginModalOpen.value = false;
      return { success: true, message: 'เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จ' };
    }
    return { success: false, message: 'รหัสผ่าน PIN ไม่ถูกต้อง (ค่าเริ่มต้น: 8888)' };
  };

  const logout = () => {
    isAdmin.value = false;
    localStorage.removeItem(STORAGE_KEY);
  };

  const updatePin = (oldPin, newPin) => {
    if (oldPin.trim() !== adminPin.value.trim()) {
      return { success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
    }
    adminPin.value = newPin.trim();
    localStorage.setItem(PIN_STORAGE_KEY, newPin.trim());
    return { success: true, message: 'เปลี่ยนรหัสผ่าน PIN ผู้ดูแลระบบสำเร็จแล้ว' };
  };

  return {
    isAdmin,
    adminPin,
    isLoginModalOpen,
    login,
    logout,
    updatePin
  };
}
