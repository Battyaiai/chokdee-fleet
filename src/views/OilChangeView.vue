<template>
  <div class="space-y-6">
    <!-- Top summary card -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <Droplet :size="24" />
        </div>
        <div>
          <span class="text-xs font-medium text-slate-500 block">ประวัติการเปลี่ยนถ่ายทั้งหมด</span>
          <div class="text-2xl font-bold text-slate-900 leading-tight">
            {{ filteredRecords.length }} <span class="text-sm font-normal text-slate-500">ครั้ง</span>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
          <DollarSign :size="24" />
        </div>
        <div>
          <span class="text-xs font-medium text-slate-500 block">ค่าใช้จ่ายรวมน้ำมันเครื่อง</span>
          <div class="text-2xl font-bold text-slate-900 leading-tight">
            ฿{{ totalCost.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          class="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-xs"
          placeholder="ค้นหาทะเบียน, รายการน้ำมันเครื่อง..."
          v-model="searchTerm"
        />
      </div>

      <div class="flex items-center gap-2">
        <select 
          class="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
          v-model="vehicleFilter"
        >
          <option value="all">รถทุกคัน</option>
          <option v-for="v in vehicles" :key="v.id" :value="v.id">
            {{ v.code }} - {{ v.plateNumber }} ({{ v.brand }})
          </option>
        </select>

        <AppButton v-if="isAdmin" variant="primary" size="md" @click="handleOpenAdd">
          <Plus :size="16" />
          <span class="whitespace-nowrap">บันทึกเปลี่ยนน้ำมันเครื่อง</span>
        </AppButton>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse min-w-[850px]">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">วันที่</th>
              <th class="px-5 py-3">รถ / รหัส</th>
              <th class="px-5 py-3">ทะเบียน</th>
              <th class="px-5 py-3 text-right">เลขไมล์ ณ วันที่เปลี่ยน</th>
              <th class="px-5 py-3">รายการน้ำมัน / รายละเอียด</th>
              <th class="px-5 py-3 text-right">ค่าใช้จ่าย (บาท)</th>
              <th class="px-5 py-3">นัดครั้งต่อไป</th>
              <th class="px-5 py-3 text-right">เลขไมล์เป้าหมาย</th>
              <th class="px-5 py-3">ผู้บันทึก</th>
              <th v-if="isAdmin" class="px-5 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredRecords.length === 0">
              <td colspan="10" class="text-center py-10 text-slate-400">
                ไม่พบประวัติการเปลี่ยนถ่ายน้ำมันเครื่อง
              </td>
            </tr>
            <tr 
              v-else 
              v-for="rec in filteredRecords" 
              :key="rec.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-1.5 font-medium text-slate-800">
                  <Calendar :size="14" class="text-slate-400 shrink-0" />
                  <span>{{ rec.changeDate || '-' }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="font-bold text-blue-600">{{ rec.vehicle?.code || '-' }}</div>
                <div class="text-xs text-slate-400">{{ rec.vehicle?.brand }} {{ rec.vehicle?.model }}</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                  {{ rec.vehicle?.plateNumber }} {{ rec.vehicle?.province }}
                </span>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right font-bold text-slate-900">
                {{ (rec.currentMileage || 0).toLocaleString() }} กม.
              </td>
              <td class="px-5 py-3.5">
                <div class="font-medium text-slate-900">{{ rec.oilDetails || '-' }}</div>
                <div v-if="rec.notes" class="text-xs text-slate-400 mt-0.5">หมายเหตุ: {{ rec.notes }}</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right font-bold text-slate-900">
                ฿{{ (rec.cost || 0).toLocaleString() }}
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-slate-700">
                {{ rec.nextChangeDate || '-' }}
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right text-slate-700">
                {{ rec.nextMileage ? `${rec.nextMileage.toLocaleString()} กม.` : '-' }}
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">{{ rec.createdBy || '-' }}</td>
              <td v-if="isAdmin" class="px-5 py-3.5 whitespace-nowrap text-center">
                <div class="inline-flex items-center gap-1.5">
                  <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" @click="handleOpenEdit(rec)" title="แก้ไข" type="button">
                    <Edit2 :size="15" />
                  </button>
                  <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors" @click="handleDelete(rec.id)" title="ลบ" type="button">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <Modal
      :isOpen="isModalOpen"
      @close="isModalOpen = false"
      :title="editingId ? 'แก้ไขประวัติน้ำมันเครื่อง' : 'บันทึกการเปลี่ยนถ่ายน้ำมันเครื่อง'"
    >
      <form @submit.prevent="handleSave" class="space-y-5">
        <!-- Section 1 -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. ข้อมูลรถและวันที่เปลี่ยน
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลือกรถ <span class="text-rose-500">*</span></label>
              <select
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.vehicleId"
                required
              >
                <option value="">-- กรุณาเลือกรถ --</option>
                <option v-for="v in vehicles" :key="v.id" :value="v.id">
                  {{ v.code }} - ทะเบียน {{ v.plateNumber }} {{ v.province }} ({{ v.brand }} {{ v.model }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันที่เปลี่ยนถ่าย <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.changeDate"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขไมล์ ณ วันที่เปลี่ยน (กม.)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.currentMileage"
                placeholder="เช่น 145000"
              />
            </div>
          </div>
        </div>

        <!-- Section 2 -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียดและค่าใช้จ่าย
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">รายการน้ำมัน / รายละเอียด <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.oilDetails"
                placeholder="เช่น น้ำมันเครื่องดีเซล 15W-40 + กรองน้ำมันเครื่องแท้"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">ค่าใช้จ่ายรวม (บาท)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.cost"
                placeholder="เช่น 3500"
              />
            </div>
          </div>
        </div>

        <!-- Section 3 -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            3. นัดหมายครั้งต่อไป
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">นัดเปลี่ยนครั้งต่อไป (วันที่)</label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.nextChangeDate"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขไมล์ครั้งต่อไป (กม.)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.nextMileage"
                placeholder="เช่น 155000"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
              <textarea
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                rows="2"
                v-model="formData.notes"
                placeholder="เช่น เช็กระดับน้ำมันเกียร์และเฟืองท้ายแล้วปกติ..."
              />
            </div>
            <div class="sm:col-span-2">
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-700">ชื่อช่าง / ผู้บันทึก <span class="text-rose-500">*</span></label>
                <button 
                  type="button" 
                  class="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
                  @click="customCreatedByMode = !customCreatedByMode"
                >
                  {{ customCreatedByMode ? '← เลือกจากรายชื่อ' : '+ พิมพ์ระบุเอง' }}
                </button>
              </div>

              <select
                v-if="!customCreatedByMode"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.createdBy"
                required
              >
                <option v-for="staff in getStaffFormattedList" :key="staff.id" :value="staff.label">
                  {{ staff.label }}{{ staff.isDefault ? ' (ค่าเริ่มต้น)' : '' }}
                </option>
              </select>

              <input
                v-else
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.createdBy"
                placeholder="ระบุชื่อช่างหรือผู้บันทึก..."
                required
              />
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <AppButton variant="secondary" @click="isModalOpen = false">
            ยกเลิก
          </AppButton>
          <AppButton type="submit" variant="primary" :loading="saving">
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกประวัติน้ำมันเครื่อง' }}
          </AppButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Droplet, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign 
} from 'lucide-vue-next';
import { api } from '../api';
import Modal from '../components/Modal.vue';
import AppButton from '../components/AppButton.vue';
import { useAuth } from '../composables/useAuth';
import { useStaff } from '../composables/useStaff';

const { isAdmin } = useAuth();
const { getStaffFormattedList, defaultStaffLabel, loadStaff } = useStaff();

const customCreatedByMode = ref(false);
const records = ref([]);
const vehicles = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const vehicleFilter = ref('all');

const isModalOpen = ref(false);
const editingId = ref(null);
const saving = ref(false);

const formData = ref({
  vehicleId: '',
  changeDate: new Date().toISOString().split('T')[0],
  currentMileage: '',
  oilDetails: '',
  cost: '',
  nextChangeDate: '',
  nextMileage: '',
  notes: '',
  createdBy: defaultStaffLabel.value
});

const loadData = async () => {
  try {
    loading.value = true;
    const [vRes, oilRes] = await Promise.all([
      api.getVehicles(),
      api.getOilChanges()
    ]);
    if (vRes.success) vehicles.value = vRes.data;
    if (oilRes.success) records.value = oilRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
  loadStaff();
});

const handleOpenAdd = () => {
  const defaultVeh = vehicles.value[0]?.id || '';
  const today = new Date();
  const nextSixMonths = new Date(today);
  nextSixMonths.setMonth(today.getMonth() + 6);

  editingId.value = null;
  customCreatedByMode.value = false;
  formData.value = {
    vehicleId: defaultVeh,
    changeDate: today.toISOString().split('T')[0],
    currentMileage: '',
    oilDetails: 'น้ำมันเครื่องดีเซล 15W-40 + กรองน้ำมันเครื่องแท้',
    cost: '',
    nextChangeDate: nextSixMonths.toISOString().split('T')[0],
    nextMileage: '',
    notes: '',
    createdBy: defaultStaffLabel.value
  };
  isModalOpen.value = true;
};

const handleOpenEdit = (rec) => {
  editingId.value = rec.id;
  const isCustom = !getStaffFormattedList.value.some(s => s.label === rec.createdBy);
  customCreatedByMode.value = isCustom;
  formData.value = {
    vehicleId: rec.vehicleId || '',
    changeDate: rec.changeDate || '',
    currentMileage: rec.currentMileage || '',
    oilDetails: rec.oilDetails || '',
    cost: rec.cost || '',
    nextChangeDate: rec.nextChangeDate || '',
    nextMileage: rec.nextMileage || '',
    notes: rec.notes || '',
    createdBy: rec.createdBy || defaultStaffLabel.value
  };
  isModalOpen.value = true;
};

const handleSave = async () => {
  if (!formData.value.vehicleId || !formData.value.changeDate) {
    alert('กรุณาเลือกรถและระบุวันที่เปลี่ยนน้ำมันเครื่อง');
    return;
  }

  try {
    saving.value = true;
    if (editingId.value) {
      await api.updateOilChange(editingId.value, formData.value);
    } else {
      await api.createOilChange(formData.value);
    }
    isModalOpen.value = false;
    await loadData();
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id) => {
  if (!window.confirm('คุณต้องการลบประวัติการเปลี่ยนน้ำมันเครื่องนี้ใช่หรือไม่?')) return;
  try {
    await api.deleteOilChange(id);
    await loadData();
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการลบ: ' + err.message);
  }
};

const filteredRecords = computed(() => {
  return records.value.filter(rec => {
    const veh = rec.vehicle;
    const plate = veh ? `${veh.plateNumber} ${veh.province}` : '';
    const brandModel = veh ? `${veh.brand} ${veh.model}` : '';
    const details = rec.oilDetails || '';

    const q = searchTerm.value.toLowerCase();
    const matchSearch = 
      plate.toLowerCase().includes(q) ||
      brandModel.toLowerCase().includes(q) ||
      details.toLowerCase().includes(q);

    const matchVeh = vehicleFilter.value === 'all' || rec.vehicleId === vehicleFilter.value;
    return matchSearch && matchVeh;
  });
});

const totalCost = computed(() => {
  return filteredRecords.value.reduce((s, r) => s + (Number(r.cost) || 0), 0);
});
</script>
