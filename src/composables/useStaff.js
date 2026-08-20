import { ref, computed } from 'vue';
import { api } from '../api';

const staffList = ref([]);
const loadingStaff = ref(false);

export function useStaff() {
  const loadStaff = async (force = false) => {
    if (staffList.value.length > 0 && !force) return staffList.value;
    try {
      loadingStaff.value = true;
      const res = await api.getStaffMembers();
      if (res.success && Array.isArray(res.data)) {
        staffList.value = res.data;
      }
    } catch (err) {
      console.error('Error loading staff members:', err);
    } finally {
      loadingStaff.value = false;
    }
    return staffList.value;
  };

  const defaultStaff = computed(() => {
    return staffList.value.find(s => s.isDefault) || staffList.value[0] || null;
  });

  const defaultStaffLabel = computed(() => {
    if (!defaultStaff.value) return 'พัควลัญชญ์ อุไรล้ำ (พนักงานไอที)';
    return `${defaultStaff.value.name}${defaultStaff.value.role ? ` (${defaultStaff.value.role})` : ''}`;
  });

  const getStaffFormattedList = computed(() => {
    return staffList.value.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      isDefault: s.isDefault,
      label: `${s.name}${s.role ? ` (${s.role})` : ''}`
    }));
  });

  const addStaff = async (data) => {
    const res = await api.createStaffMember(data);
    if (res.success) {
      await loadStaff(true);
    }
    return res;
  };

  const updateStaff = async (id, data) => {
    const res = await api.updateStaffMember(id, data);
    if (res.success) {
      await loadStaff(true);
    }
    return res;
  };

  const deleteStaff = async (id) => {
    const res = await api.deleteStaffMember(id);
    if (res.success) {
      await loadStaff(true);
    }
    return res;
  };

  const setDefaultStaff = async (id) => {
    const res = await api.setDefaultStaffMember(id);
    if (res.success) {
      await loadStaff(true);
    }
    return res;
  };

  return {
    staffList,
    loadingStaff,
    defaultStaff,
    defaultStaffLabel,
    getStaffFormattedList,
    loadStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    setDefaultStaff
  };
}
