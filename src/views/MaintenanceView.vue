<template>
  <div class="space-y-6">
    <!-- Top summary card -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
          <Wrench :size="24" />
        </div>
        <div>
          <span class="text-xs font-medium text-slate-500 block">รายการซ่อมบำรุงทั้งหมด</span>
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
          <span class="text-xs font-medium text-slate-500 block">ค่าใช้จ่ายซ่อมบำรุงรวม</span>
          <div class="text-2xl font-bold text-rose-600 leading-tight">
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
          placeholder="ค้นหาทะเบียน, รายการซ่อม, อู่..."
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

        <AppButton variant="primary" size="md" @click="handleOpenAdd">
          <Plus :size="16" />
          <span class="whitespace-nowrap">บันทึกงานซ่อมบำรุง</span>
        </AppButton>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse min-w-[850px]">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">วันที่ซ่อม</th>
              <th class="px-5 py-3">รถ / รหัส</th>
              <th class="px-5 py-3">ทะเบียน</th>
              <th class="px-5 py-3 text-right">เลขไมล์</th>
              <th class="px-5 py-3">รายละเอียดการซ่อม</th>
              <th class="px-5 py-3">อู่ / ร้านซ่อม</th>
              <th class="px-5 py-3 text-right">ค่าใช้จ่าย (บาท)</th>
              <th class="px-5 py-3">ผู้บันทึก</th>
              <th class="px-5 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredRecords.length === 0">
              <td colspan="9" class="text-center py-10 text-slate-400">
                ไม่พบประวัติการซ่อมบำรุงตามเงื่อนไข
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
                  <span>{{ rec.repairDate || '-' }}</span>
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
              <td class="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-700">
                {{ rec.mileage ? `${rec.mileage.toLocaleString()} กม.` : '-' }}
              </td>
              <td class="px-5 py-3.5">
                <div class="font-semibold text-slate-900">{{ rec.description }}</div>
                <div v-if="rec.notes" class="text-xs text-slate-400 mt-0.5">หมายเหตุ: {{ rec.notes }}</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-1.5 text-slate-600">
                  <Building2 :size="14" class="text-slate-400 shrink-0" />
                  <span>{{ rec.garage || '-' }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right font-bold text-rose-600">
                ฿{{ (rec.cost || 0).toLocaleString() }}
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">{{ rec.createdBy || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-center">
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
      :title="editingId ? 'แก้ไขประวัติการซ่อมบำรุง' : 'บันทึกประวัติการซ่อมบำรุง'"
    >
      <form @submit.prevent="handleSave" class="space-y-5">
        <!-- Section 1 -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. ข้อมูลรถและวันที่ซ่อม
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
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันที่ซ่อม <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.repairDate"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขไมล์ ณ วันที่ซ่อม (กม.)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.mileage"
                placeholder="เช่น 147200"
              />
            </div>
          </div>
        </div>

        <!-- Section 2 -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียดงานซ่อมและค่าใช้จ่าย
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดการซ่อม <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.description"
                placeholder="เช่น เปลี่ยนผ้าเบรกหน้า-หลัง, เปลี่ยนยาง 4 เส้น, เปลี่ยนแบตเตอรี่"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">อู่ / ร้านซ่อม / ศูนย์บริการ</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.garage"
                placeholder="เช่น อู่เจริญยนต์ นครปฐม"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ค่าใช้จ่าย (บาท)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.cost"
                placeholder="เช่น 6500"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
              <textarea
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                rows="2"
                v-model="formData.notes"
                placeholder="เช่น การรับประกันสินค้า หรือรายละเอียดอะไหล่..."
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้บันทึก <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.createdBy"
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
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกประวัติการซ่อม' }}
          </AppButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Wrench, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign,
  Building2
} from 'lucide-vue-next';
import { api } from '../api';
import Modal from '../components/Modal.vue';
import AppButton from '../components/AppButton.vue';

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
  repairDate: new Date().toISOString().split('T')[0],
  mileage: '',
  description: '',
  garage: '',
  cost: '',
  notes: '',
  createdBy: 'สมศักดิ์ ข้าวดี (หัวหน้าคลัง)'
});

const loadData = async () => {
  try {
    loading.value = true;
    const [vRes, mntRes] = await Promise.all([
      api.getVehicles(),
      api.getMaintenances()
    ]);
    if (vRes.success) vehicles.value = vRes.data;
    if (mntRes.success) records.value = mntRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const handleOpenAdd = () => {
  const defaultVeh = vehicles.value[0]?.id || '';
  editingId.value = null;
  formData.value = {
    vehicleId: defaultVeh,
    repairDate: new Date().toISOString().split('T')[0],
    mileage: '',
    description: '',
    garage: '',
    cost: '',
    notes: '',
    createdBy: 'สมศักดิ์ ข้าวดี (หัวหน้าคลัง)'
  };
  isModalOpen.value = true;
};

const handleOpenEdit = (rec) => {
  editingId.value = rec.id;
  formData.value = {
    vehicleId: rec.vehicleId || '',
    repairDate: rec.repairDate || '',
    mileage: rec.mileage || '',
    description: rec.description || '',
    garage: rec.garage || '',
    cost: rec.cost || '',
    notes: rec.notes || '',
    createdBy: rec.createdBy || 'สมศักดิ์ ข้าวดี'
  };
  isModalOpen.value = true;
};

const handleSave = async () => {
  if (!formData.value.vehicleId || !formData.value.description) {
    alert('กรุณาเลือกรถและระบุรายละเอียดการซ่อม');
    return;
  }

  try {
    saving.value = true;
    if (editingId.value) {
      await api.updateMaintenance(editingId.value, formData.value);
    } else {
      await api.createMaintenance(formData.value);
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
  if (!window.confirm('คุณต้องการลบประวัติการซ่อมบำรุงนี้ใช่หรือไม่?')) return;
  try {
    await api.deleteMaintenance(id);
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
    const desc = rec.description || '';
    const garage = rec.garage || '';

    const q = searchTerm.value.toLowerCase();
    const matchSearch = 
      plate.toLowerCase().includes(q) ||
      brandModel.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      garage.toLowerCase().includes(q);

    const matchVeh = vehicleFilter.value === 'all' || rec.vehicleId === vehicleFilter.value;
    return matchSearch && matchVeh;
  });
});

const totalCost = computed(() => {
  return filteredRecords.value.reduce((s, r) => s + (Number(r.cost) || 0), 0);
});
</script>
