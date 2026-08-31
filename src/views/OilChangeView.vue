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
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 text-base font-bold text-slate-800 border-b border-slate-200">
            <tr>
              <th class="px-5 py-4 whitespace-nowrap">วันที่</th>
              <th class="px-5 py-4 min-w-[200px]">รถ / รหัส</th>
              <th class="px-5 py-4 whitespace-nowrap">ทะเบียน</th>
              <th class="px-5 py-4 text-right whitespace-nowrap">เลขไมล์ ณ วันที่เปลี่ยน</th>
              <th class="px-5 py-4 min-w-[260px]">รายการน้ำมัน / รายละเอียด</th>
              <th class="px-5 py-4 text-right whitespace-nowrap">ค่าใช้จ่าย (บาท)</th>
              <th class="px-5 py-4 whitespace-nowrap">นัดครั้งต่อไป</th>
              <th class="px-5 py-4 text-right whitespace-nowrap">เลขไมล์เป้าหมาย</th>
              <th v-if="isAdmin" class="px-5 py-4 text-center whitespace-nowrap w-24">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredRecords.length === 0">
              <td :colspan="isAdmin ? 9 : 8" class="text-center py-12 text-slate-400 text-base">
                ไม่พบประวัติการเปลี่ยนถ่ายน้ำมันเครื่อง
              </td>
            </tr>
            <tr 
              v-else 
              v-for="rec in filteredRecords" 
              :key="rec.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-4.5 whitespace-nowrap align-top">
                <div class="flex items-center gap-2 font-bold text-slate-900 text-lg">
                  <Calendar :size="18" class="text-blue-500 shrink-0" />
                  <span>{{ rec.changeDate || '-' }}</span>
                </div>
              </td>
              <td class="px-5 py-4.5 align-top max-w-[240px]">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-blue-600 text-lg">{{ rec.vehicle?.code || '-' }}</span>
                  <span v-if="rec.vehicle?.name" class="font-bold text-blue-900 text-base bg-blue-100/90 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                    {{ rec.vehicle.name }}
                  </span>
                </div>
                <div class="text-base font-bold text-slate-800 mt-1 leading-snug break-words">
                  {{ rec.vehicle?.brand }} {{ rec.vehicle?.model }}
                </div>
                <div v-if="rec.vehicle?.engineNo || rec.vehicle?.vin" class="text-xs text-slate-600 font-mono mt-1.5 space-y-0.5 leading-tight">
                  <div v-if="rec.vehicle?.engineNo" class="break-words" :title="'เลขเครื่อง: ' + rec.vehicle.engineNo">
                    <span class="text-slate-400 font-sans font-medium">เครื่อง:</span> <span class="font-bold text-slate-800">{{ rec.vehicle.engineNo }}</span>
                  </div>
                  <div v-if="rec.vehicle?.vin" class="break-words" :title="'เลขตัวรถ: ' + rec.vehicle.vin">
                    <span class="text-slate-400 font-sans font-medium">คัสซี:</span> <span class="font-bold text-slate-800">{{ rec.vehicle.vin }}</span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap align-top">
                <div class="inline-block font-mono font-black text-lg bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs leading-tight">
                  {{ rec.vehicle?.plateNumber }}
                </div>
                <div class="text-sm font-bold text-slate-500 mt-1">
                  {{ rec.vehicle?.province }}
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap text-right align-top">
                <div class="text-lg font-black text-slate-900">
                  {{ (rec.currentMileage || 0).toLocaleString() }} กม.
                </div>
              </td>
              <td class="px-5 py-4.5 align-top max-w-[320px]">
                <div class="font-bold text-slate-950 text-lg leading-snug break-words">
                  {{ rec.oilDetails || '-' }}
                </div>
                <div v-if="rec.notes" class="text-sm text-slate-700 mt-2 leading-relaxed break-words bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span class="font-bold text-slate-800">หมายเหตุ:</span> {{ rec.notes }}
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap text-right align-top">
                <div class="text-xl font-black text-blue-700">
                  ฿{{ (rec.cost || 0).toLocaleString() }}
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap align-top">
                <div class="text-base font-bold text-slate-800">
                  {{ rec.nextChangeDate || '-' }}
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap text-right align-top">
                <div class="text-lg font-bold text-amber-700">
                  {{ rec.nextMileage ? `${rec.nextMileage.toLocaleString()} กม.` : '-' }}
                </div>
              </td>
              <td v-if="isAdmin" class="px-5 py-4.5 whitespace-nowrap text-center align-top">
                <div class="inline-flex items-center gap-2 pt-0.5">
                  <button class="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 hover:border-blue-300" @click="handleOpenEdit(rec)" title="แก้ไข" type="button">
                    <Edit2 :size="18" />
                  </button>
                  <button class="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-300" @click="handleDelete(rec.id)" title="ลบ" type="button">
                    <Trash2 :size="18" />
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
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. ข้อมูลรถและวันที่เปลี่ยน
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เลือกรถ <span class="text-rose-500">*</span></label>
              <select
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.vehicleId"
                required
              >
                <option value="">-- กรุณาเลือกรถ --</option>
                <option v-for="v in vehicles" :key="v.id" :value="v.id">
                  {{ v.code }} - {{ v.name ? `[${v.name}] ` : '' }}ทะเบียน {{ v.plateNumber }} {{ v.province }} ({{ v.brand }} {{ v.model }})
                </option>
              </select>
            </div>

            <!-- Selected Vehicle Info Summary Box -->
            <div v-if="selectedVehicleInfo" class="sm:col-span-2 bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-sm space-y-2 shadow-2xs">
              <div class="font-bold text-blue-900 flex items-center justify-between text-base">
                <span>{{ selectedVehicleInfo.code }} - {{ selectedVehicleInfo.brand }} {{ selectedVehicleInfo.model }} {{ selectedVehicleInfo.name ? `(${selectedVehicleInfo.name})` : '' }}</span>
                <span class="font-mono bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-black text-slate-900">{{ selectedVehicleInfo.plateNumber }} {{ selectedVehicleInfo.province }}</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-mono text-xs">
                <div class="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                  <span class="text-slate-500 font-sans text-xs font-semibold block">⚙️ เลขเครื่องยนต์:</span>
                  <strong class="text-slate-900 font-bold select-all text-sm">{{ selectedVehicleInfo.engineNo || 'ยังไม่ระบุ' }}</strong>
                </div>
                <div class="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                  <span class="text-slate-500 font-sans text-xs font-semibold block">🚗 เลขตัวรถ / คัสซี (VIN):</span>
                  <strong class="text-blue-950 font-bold select-all text-sm">{{ selectedVehicleInfo.vin || 'ยังไม่ระบุ' }}</strong>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันที่เปลี่ยนน้ำมันเครื่อง <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.changeDate"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เลขไมล์ ณ วันที่เปลี่ยน (กม.)</label>
              <input
                type="number"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.currentMileage"
                placeholder="เช่น 145000"
              />
            </div>
          </div>
        </div>

        <!-- Section 2 -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียดน้ำมันเครื่องและนัดหมายถัดไป
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">รายการน้ำมัน / เกรด / รายละเอียด <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.oilDetails"
                placeholder="เช่น น้ำมันเครื่องดีเซล 15W-40 + กรองน้ำมันเครื่องแท้"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ค่าใช้จ่าย (บาท)</label>
              <input
                type="number"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.cost"
                placeholder="เช่น 3200"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันครบกำหนดครั้งต่อไป</label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.nextChangeDate"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เลขไมล์ครั้งต่อไป (กม.)</label>
              <input
                type="number"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.nextMileage"
                placeholder="เช่น 155000"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">หมายเหตุเพิ่มเติม</label>
              <textarea
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                rows="2"
                v-model="formData.notes"
                placeholder="เช่น เช็กระดับน้ำมันเกียร์และเฟืองท้ายแล้วปกติ..."
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

const selectedVehicleInfo = computed(() => {
  if (!formData.value.vehicleId) return null;
  return vehicles.value.find(v => v.id === formData.value.vehicleId) || null;
});

const filteredRecords = computed(() => {
  return [...records.value].filter(rec => {
    const veh = rec.vehicle;
    const plate = veh ? `${veh.plateNumber} ${veh.province}` : '';
    const brandModel = veh ? `${veh.brand} ${veh.model}` : '';
    const name = veh?.name || '';
    const vin = veh?.vin || '';
    const engineNo = veh?.engineNo || '';
    const details = rec.oilDetails || '';

    const q = searchTerm.value.toLowerCase();
    const matchSearch = 
      plate.toLowerCase().includes(q) ||
      brandModel.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      vin.toLowerCase().includes(q) ||
      engineNo.toLowerCase().includes(q) ||
      details.toLowerCase().includes(q);

    const matchVeh = vehicleFilter.value === 'all' || rec.vehicleId === vehicleFilter.value;
    return matchSearch && matchVeh;
  }).sort((a, b) => {
    const codeA = a.vehicle?.code || '';
    const codeB = b.vehicle?.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
});

const totalCost = computed(() => {
  return filteredRecords.value.reduce((s, r) => s + (Number(r.cost) || 0), 0);
});
</script>
