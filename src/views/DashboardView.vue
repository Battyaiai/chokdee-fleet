<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-xs text-slate-500 space-y-3">
      <Clock :size="36" class="animate-spin text-blue-600" />
      <h4 class="text-base font-semibold text-slate-700">กำลังโหลดข้อมูลแดชบอร์ด...</h4>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 bg-white rounded-xl border-l-4 border-l-rose-500 border border-slate-200 shadow-xs space-y-3">
      <h4 class="text-base font-bold text-rose-600">เกิดข้อผิดพลาดในการโหลดข้อมูล</h4>
      <p class="text-sm text-slate-600">{{ error }}</p>
      <AppButton variant="secondary" size="sm" @click="loadStats">
        ลองใหม่อีกครั้ง
      </AppButton>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- 1. Quick Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <!-- Card 1: รถทั้งหมด -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Truck :size="24" />
          </div>
          <div class="min-w-0">
            <span class="text-xs font-medium text-slate-500 block">รถทั้งหมด</span>
            <div class="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
              {{ stats?.totalVehicles || 0 }} <span class="text-xs font-normal text-slate-500">คัน</span>
            </div>
            <span class="text-xs text-slate-500 block mt-0.5">ใช้งาน {{ stats?.activeVehicles || 0 }} | พัก {{ stats?.inactiveVehicles || 0 }}</span>
          </div>
        </div>

        <!-- Card 2: ประกันใกล้หมด -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <ShieldAlert :size="24" />
          </div>
          <div class="min-w-0">
            <span class="text-xs font-medium text-slate-500 block">ประกันใกล้หมด</span>
            <div 
              :class="['text-2xl font-bold leading-tight mt-0.5', (stats?.insAlertCount || 0) > 0 ? 'text-orange-600' : 'text-slate-900']"
            >
              {{ stats?.insAlertCount || 0 }} <span class="text-xs font-normal text-slate-500">รายการ</span>
            </div>
            <span class="text-xs text-slate-500 block mt-0.5">เตือนล่วงหน้า 2 เดือน</span>
          </div>
        </div>

        <!-- Card 3: ทะเบียนใกล้ครบกำหนด -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <FileCheck :size="24" />
          </div>
          <div class="min-w-0">
            <span class="text-xs font-medium text-slate-500 block">ทะเบียนใกล้ครบกำหนด</span>
            <div 
              :class="['text-2xl font-bold leading-tight mt-0.5', (stats?.taxAlertCount || 0) > 0 ? 'text-amber-700' : 'text-slate-900']"
            >
              {{ stats?.taxAlertCount || 0 }} <span class="text-xs font-normal text-slate-500">รายการ</span>
            </div>
            <span class="text-xs text-slate-500 block mt-0.5">เตือนล่วงหน้า 3 เดือน</span>
          </div>
        </div>

        <!-- Card 4: พ.ร.บ. ใกล้หมด -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle :size="24" />
          </div>
          <div class="min-w-0">
            <span class="text-xs font-medium text-slate-500 block">พ.ร.บ. ใกล้หมด</span>
            <div 
              :class="['text-2xl font-bold leading-tight mt-0.5', (stats?.prbAlertCount || 0) > 0 ? 'text-rose-600' : 'text-slate-900']"
            >
              {{ stats?.prbAlertCount || 0 }} <span class="text-xs font-normal text-slate-500">รายการ</span>
            </div>
            <span class="text-xs text-slate-500 block mt-0.5">เตือนล่วงหน้า 2 เดือน</span>
          </div>
        </div>

        <!-- Card 5: ค่าใช้จ่ายดูแลเดือนนี้ -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5 sm:col-span-2 lg:col-span-1">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Banknote :size="24" />
          </div>
          <div class="min-w-0">
            <span class="text-xs font-medium text-slate-500 block">ค่าใช้จ่ายดูแลเดือนนี้</span>
            <div class="text-2xl font-bold text-emerald-700 leading-tight mt-0.5">
              ฿{{ (stats?.monthlyExpenses || 0).toLocaleString() }}
            </div>
            <span class="text-xs text-slate-500 block mt-0.5">ซ่อม ฿{{ (stats?.monthlyMaintenanceCost || 0).toLocaleString() }} | น้ำมัน ฿{{ (stats?.monthlyOilCost || 0).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 2. Action Required Section -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <AlertTriangle :size="20" class="text-orange-600 shrink-0" />
              <h3 class="text-base sm:text-lg font-bold text-slate-900">
                รายการที่ต้องดำเนินการ (แจ้งเตือนวันครบกำหนด)
              </h3>
              <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                {{ actionItems.length }} รายการ
              </span>
            </div>

            <!-- Category Filters -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button 
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  filterType === 'all' 
                    ? 'bg-blue-600 text-white shadow-xs font-semibold' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                ]"
                @click="filterType = 'all'"
                type="button"
              >
                ทั้งหมด ({{ actionItems.length }})
              </button>
              <button 
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  filterType === 'insurance' 
                    ? 'bg-blue-600 text-white shadow-xs font-semibold' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                ]"
                @click="filterType = 'insurance'"
                type="button"
              >
                ประกัน ({{ stats?.insAlertCount || 0 }})
              </button>
              <button 
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  filterType === 'tax' 
                    ? 'bg-blue-600 text-white shadow-xs font-semibold' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                ]"
                @click="filterType = 'tax'"
                type="button"
              >
                ทะเบียน ({{ stats?.taxAlertCount || 0 }})
              </button>
              <button 
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  filterType === 'prb' 
                    ? 'bg-blue-600 text-white shadow-xs font-semibold' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                ]"
                @click="filterType = 'prb'"
                type="button"
              >
                พ.ร.บ. ({{ stats?.prbAlertCount || 0 }})
              </button>
              <button 
                :class="[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  filterType === 'oil' 
                    ? 'bg-blue-600 text-white shadow-xs font-semibold' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                ]"
                @click="filterType = 'oil'"
                type="button"
              >
                น้ำมันเครื่อง ({{ oilAlertCount }})
              </button>
            </div>
          </div>

          <!-- Secondary Toolbar: Search + Urgency Filters -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div class="relative flex-1 max-w-sm">
              <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                class="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น, รหัสรถ..."
                v-model="searchQuery"
              />
            </div>

            <!-- Urgency Chips -->
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span class="text-xs text-slate-500 font-medium hidden md:inline">ระดับความเร่งด่วน:</span>
              <button 
                :class="[
                  'px-2.5 py-1 text-xs rounded-md transition-colors font-medium whitespace-nowrap',
                  urgencyFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
                @click="urgencyFilter = 'all'"
                type="button"
              >
                ทุกระดับ
              </button>
              <button 
                :class="[
                  'px-2.5 py-1 text-xs rounded-md transition-colors font-medium whitespace-nowrap',
                  urgencyFilter === 'expired' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                ]"
                @click="urgencyFilter = 'expired'"
                type="button"
              >
                🔴 หมดอายุแล้ว ({{ expiredCount }})
              </button>
              <button 
                :class="[
                  'px-2.5 py-1 text-xs rounded-md transition-colors font-medium whitespace-nowrap',
                  urgencyFilter === 'urgent' ? 'bg-orange-600 text-white font-bold' : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                ]"
                @click="urgencyFilter = 'urgent'"
                type="button"
              >
                🟠 เร่งด่วน ≤ 7 วัน ({{ urgentCount }})
              </button>
              <button 
                :class="[
                  'px-2.5 py-1 text-xs rounded-md transition-colors font-medium whitespace-nowrap',
                  urgencyFilter === 'warning' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                ]"
                @click="urgencyFilter = 'warning'"
                type="button"
              >
                🟡 ใกล้ครบกำหนด ({{ warningCount }})
              </button>
            </div>
          </div>
        </div>

        <!-- Table State -->
        <div v-if="filteredActionItems.length === 0" class="p-8 text-center space-y-2">
          <CheckCircle :size="36" class="text-emerald-500 mx-auto" />
          <h4 class="text-base font-semibold text-slate-800">
            {{ searchQuery ? 'ไม่พบรายการตามคำค้นหา' : 'ยอดเยี่ยม! ไม่มีรายการครบกำหนดเร่งด่วนในหมวดนี้' }}
          </h4>
          <p class="text-xs text-slate-500">
            {{ searchQuery ? 'ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง' : 'เอกสารและกำหนดการทั้งหมดของรถยนต์อยู่ในสถานะปกติ' }}
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-800 font-bold text-base">
                <th class="px-5 py-4 w-44">รายการ</th>
                <th class="px-5 py-4 min-w-[200px]">รหัส / รถ</th>
                <th class="px-5 py-4 w-40">ทะเบียน</th>
                <th class="px-5 py-4 w-40">วันครบกำหนด</th>
                <th class="px-5 py-4 text-center w-48">ระยะเวลาคงเหลือ</th>
                <th class="px-5 py-4 w-44">สถานะ</th>
                <th class="px-5 py-4 text-center w-44">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr 
                v-for="item in filteredActionItems" 
                :key="item.id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <td class="px-5 py-4.5 align-top">
                  <div class="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span 
                      :class="[
                        'w-2.5 h-2.5 rounded-full shrink-0',
                        item.type === 'insurance' ? 'bg-blue-600' : item.type === 'tax' ? 'bg-amber-500' : item.type === 'prb' ? 'bg-rose-500' : 'bg-emerald-500'
                      ]"
                    />
                    <span>{{ item.typeName }}</span>
                  </div>
                  <div class="text-sm font-semibold text-slate-500 mt-1 leading-snug break-words">{{ item.companyOrNo }}</div>
                </td>
                <td class="px-5 py-4.5 align-top">
                  <div class="font-black text-blue-600 text-lg">{{ item.vehicleCode }}</div>
                  <div class="text-sm font-bold text-slate-800 mt-0.5 leading-snug break-words">{{ item.vehicleName }}</div>
                </td>
                <td class="px-5 py-4.5 align-top whitespace-nowrap">
                  <span class="inline-block px-3 py-1.5 rounded-xl font-mono font-black text-base bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs">
                    {{ item.vehiclePlate }}
                  </span>
                </td>
                <td class="px-5 py-4.5 align-top whitespace-nowrap">
                  <div class="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                    <Calendar :size="16" class="text-blue-500 shrink-0" />
                    <span>{{ item.dueDateFormatted }}</span>
                  </div>
                </td>
                <td class="px-5 py-4.5 align-top text-center whitespace-nowrap">
                  <StatusBadge :days="item.daysRemaining" />
                </td>
                <td class="px-5 py-4.5 align-top whitespace-nowrap">
                  <span 
                    :class="[
                      'text-sm font-bold',
                      item.daysRemaining < 0 ? 'text-rose-600' : item.daysRemaining <= 7 ? 'text-orange-600' : 'text-amber-700'
                    ]"
                  >
                    {{ item.statusText }}
                  </span>
                </td>
                <td class="px-5 py-4.5 align-top text-center whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5">
                    <AppButton 
                      variant="primary" 
                      size="sm"
                      @click="emit('renewDocument', item)"
                      :title="item.type === 'oil' ? 'บันทึกเปลี่ยนน้ำมันเครื่อง' : 'ต่ออายุด่วน 1-Click'"
                      class="shadow-2xs"
                    >
                      <Sparkles :size="13" class="text-amber-300" />
                      <span>{{ item.type === 'oil' ? 'เปลี่ยนถ่าย' : 'ต่ออายุ' }}</span>
                    </AppButton>

                    <AppButton 
                      variant="secondary" 
                      size="sm"
                      @click="emit('navigateToVehicle', item.vehicleId)"
                      title="ดูรายละเอียดรถคันนี้"
                    >
                      <Eye :size="14" />
                    </AppButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Quick Shortcuts Banner -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Quick Action Card -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h4 class="text-sm font-bold text-blue-900 uppercase tracking-wide">
            การทำงานด่วน
          </h4>
          <div class="space-y-2">
            <button 
              class="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-sm font-medium transition-colors text-left"
              @click="emit('navigateToDocuments')"
              type="button"
            >
              <span>บันทึกต่อประกัน / ทะเบียน / พ.ร.บ.</span>
              <ArrowRight :size="16" class="text-slate-400" />
            </button>
            <button 
              class="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-sm font-medium transition-colors text-left"
              @click="emit('navigateToOil')"
              type="button"
            >
              <span>บันทึกเปลี่ยนถ่ายน้ำมันเครื่อง</span>
              <ArrowRight :size="16" class="text-slate-400" />
            </button>
            <button 
              class="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-sm font-medium transition-colors text-left"
              @click="emit('navigateToMaintenance')"
              type="button"
            >
              <span>บันทึกรายการซ่อมบำรุง</span>
              <ArrowRight :size="16" class="text-slate-400" />
            </button>
          </div>
        </div>

        <!-- Rules Info Card -->
        <div class="bg-blue-50/60 border border-blue-200 rounded-xl p-5 shadow-xs space-y-2">
          <h4 class="text-sm font-bold text-blue-900 uppercase tracking-wide">
            ระบบคำนวณและแจ้งเตือนวันครบกำหนด
          </h4>
          <ul class="text-xs sm:text-sm text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong class="text-slate-900">ประกันรถ:</strong> แจ้งเตือนล่วงหน้า 2 เดือนก่อนวันหมดอายุจริง</li>
            <li><strong class="text-slate-900">ต่อทะเบียน:</strong> แจ้งเตือนล่วงหน้า 3 เดือนก่อนวันครบกำหนดจริง</li>
            <li><strong class="text-slate-900">พ.ร.บ.:</strong> แจ้งเตือนล่วงหน้า 2 เดือน หรือตามเกณฑ์ที่กำหนด</li>
            <li><strong class="text-slate-900">LINE Notify:</strong> ตรวจสอบอัตโนมัติทุกวันเวลา 08:00 น. ไม่ส่งข้อความซ้ำซ้อนในวันเดียวกัน</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Truck, 
  ShieldAlert, 
  FileCheck, 
  AlertTriangle, 
  Banknote, 
  ArrowRight, 
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  Search,
  Sparkles
} from 'lucide-vue-next';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import AppButton from '../components/AppButton.vue';

const emit = defineEmits(['navigateToVehicle', 'navigateToDocuments', 'navigateToOil', 'navigateToMaintenance', 'renewDocument']);

const stats = ref(null);
const loading = ref(true);
const error = ref(null);
const filterType = ref('all');
const urgencyFilter = ref('all');
const searchQuery = ref('');

const loadStats = async () => {
  try {
    loading.value = true;
    error.value = null;
    const res = await api.getDashboardStats();
    if (res.success) {
      stats.value = res.data;
    }
  } catch (err) {
    error.value = err.message || 'ไม่สามารถโหลดข้อมูลสถิติได้';
  } finally {
    loading.value = false;
  }
};

const actionItems = computed(() => stats.value?.actionItems || []);

const oilAlertCount = computed(() => {
  return actionItems.value.filter(item => item.type === 'oil').length;
});

const expiredCount = computed(() => {
  return actionItems.value.filter(item => item.daysRemaining < 0).length;
});

const urgentCount = computed(() => {
  return actionItems.value.filter(item => item.daysRemaining >= 0 && item.daysRemaining <= 7).length;
});

const warningCount = computed(() => {
  return actionItems.value.filter(item => item.daysRemaining > 7).length;
});

const filteredActionItems = computed(() => {
  return actionItems.value.filter(item => {
    // 1. Category filter
    if (filterType.value !== 'all' && item.type !== filterType.value) {
      return false;
    }

    // 2. Urgency filter
    if (urgencyFilter.value === 'expired' && item.daysRemaining >= 0) return false;
    if (urgencyFilter.value === 'urgent' && (item.daysRemaining < 0 || item.daysRemaining > 7)) return false;
    if (urgencyFilter.value === 'warning' && item.daysRemaining <= 7) return false;

    // 3. Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchPlate = (item.vehiclePlate || '').toLowerCase().includes(q);
      const matchName = (item.vehicleName || '').toLowerCase().includes(q);
      const matchCode = (item.vehicleCode || '').toLowerCase().includes(q);
      const matchCompany = (item.companyOrNo || '').toLowerCase().includes(q);
      const matchType = (item.typeName || '').toLowerCase().includes(q);
      if (!matchPlate && !matchName && !matchCode && !matchCompany && !matchType) {
        return false;
      }
    }

    return true;
  });
});

onMounted(() => {
  loadStats();
});

defineExpose({ loadStats });
</script>
