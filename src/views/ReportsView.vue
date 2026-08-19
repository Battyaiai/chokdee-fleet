<template>
  <div class="space-y-6 print:space-y-3">
    <!-- Printable Sheet Header (Visible only when printing) -->
    <div class="print:block hidden border-b-2 border-slate-900 pb-2 mb-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-950 tracking-tight">
            ร้านโชคดีค้าข้าว (CHOKDEE RICE TRADING)
          </h2>
          <p class="text-xs text-slate-600 mt-0.5">
            รายงานระบบจัดการข้อมูลรถยนต์และยานพาหนะ | ออกเมื่อ: {{ printDate }}
          </p>
        </div>
        <div class="text-right text-xs font-semibold text-slate-700">
          <div>เอกสารทางการภายในร้าน</div>
          <div>พิมพ์เพื่อการตรวจสอบ</div>
        </div>
      </div>
    </div>

    <!-- Screen Controls (Hidden on Print) -->
    <div class="print:hidden bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <Filter :size="18" class="text-blue-600" />
          <h3 class="text-base font-bold text-slate-900">
            เลือกประเภทรายงานและเงื่อนไขการพิมพ์
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <AppButton variant="secondary" size="sm" @click="handlePrint">
            <FileDown :size="15" />
            <span>บันทึก PDF</span>
          </AppButton>
          <AppButton variant="primary" size="sm" @click="handlePrint">
            <Printer :size="15" />
            <span>สั่งพิมพ์เอกสาร A4</span>
          </AppButton>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ประเภทรายงาน</label>
          <select
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="reportType"
          >
            <option value="fleet">1. รายการรถทั้งหมด (Fleet Summary)</option>
            <option value="docs">2. รายงานเอกสาร ประกัน / พ.ร.บ. / ทะเบียน</option>
            <option value="oil">3. รายงานประวัติน้ำมันเครื่อง</option>
            <option value="maintenance">4. รายงานประวัติการซ่อมบำรุง</option>
            <option value="expenses">5. รายงานสรุปค่าใช้จ่ายแยกช่วงเวลา</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">เลือกรถ</label>
          <select
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="selectedVehicleId"
          >
            <option value="all">รถทุกคันในร้าน</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">
              {{ v.code }} - {{ v.plateNumber }} ({{ v.brand }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ตั้งแต่วันที่</label>
          <input
            type="date"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="startDate"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ถึงวันที่</label>
          <input
            type="date"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="endDate"
          />
        </div>
      </div>
    </div>

    <!-- -------------------------------------------------------------
        REPORT 1: FLEET SUMMARY
        ------------------------------------------------------------- -->
    <div v-if="reportType === 'fleet'" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none print:p-0">
      <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 print:bg-white print:px-0 print:py-1">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 print:text-sm">
          1. รายงานข้อมูลรถทั้งหมด ร้านโชคดีค้าข้าว (จำนวน {{ activeVehicles.length }} คัน)
        </h3>
      </div>
      <div class="overflow-x-auto print:overflow-visible">
        <table class="w-full text-left text-sm border-collapse min-w-[850px] print:min-w-0 print:w-full print:text-xs">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 print:bg-slate-100">
            <tr>
              <th class="px-3 py-2">รหัส</th>
              <th class="px-3 py-2">ทะเบียน / จังหวัด</th>
              <th class="px-3 py-2">ยี่ห้อ - รุ่น</th>
              <th class="px-3 py-2">ประเภทรถ</th>
              <th class="px-3 py-2 text-center">ปี</th>
              <th class="px-3 py-2 font-mono">เลขตัวถัง</th>
              <th class="px-3 py-2 text-center">สถานะ</th>
              <th class="px-3 py-2">ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="v in activeVehicles" :key="v.id" class="hover:bg-slate-50/80">
              <td class="px-3 py-2.5 font-bold text-blue-600 whitespace-nowrap">{{ v.code }}</td>
              <td class="px-3 py-2.5 whitespace-nowrap">
                <div class="font-bold font-mono text-slate-900">{{ v.plateNumber }}</div>
                <div class="text-xs text-slate-500">{{ v.province }}</div>
              </td>
              <td class="px-3 py-2.5 font-semibold text-slate-800">{{ v.brand }} {{ v.model }}</td>
              <td class="px-3 py-2.5 text-xs text-slate-600">{{ v.type }}</td>
              <td class="px-3 py-2.5 text-center text-xs">{{ v.year || '-' }}</td>
              <td class="px-3 py-2.5 font-mono text-xs text-slate-500">{{ v.vin || '-' }}</td>
              <td class="px-3 py-2.5 text-center"><StatusBadge :status="v.status" type="vehicleStatus" /></td>
              <td class="px-3 py-2.5 text-xs text-slate-500">{{ v.createdBy || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- -------------------------------------------------------------
        REPORT 2: DOCS EXPIRY STATUS
        ------------------------------------------------------------- -->
    <div v-else-if="reportType === 'docs'" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none print:p-0">
      <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 print:bg-white print:px-0 print:py-1">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 print:text-sm">
          2. รายงานสถานะเอกสาร ประกันภัย / พ.ร.บ. / ต่อทะเบียน
        </h3>
      </div>
      <div class="overflow-x-auto print:overflow-visible">
        <table class="w-full text-left text-sm border-collapse min-w-[850px] print:min-w-0 print:w-full print:text-xs">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 print:bg-slate-100">
            <tr>
              <th class="px-3 py-2">รถ / รหัส</th>
              <th class="px-3 py-2">ทะเบียน</th>
              <th class="px-3 py-2">ประเภทเอกสาร</th>
              <th class="px-3 py-2">เลขที่ / บริษัท</th>
              <th class="px-3 py-2">วันหมดอายุ / ครบกำหนด</th>
              <th class="px-3 py-2 text-right">ค่าใช้จ่าย</th>
              <th class="px-3 py-2 text-center">สถานะ</th>
              <th class="px-3 py-2">ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="(doc, idx) in activeDocs" :key="idx" class="hover:bg-slate-50/80">
              <td class="px-3 py-2.5 font-bold text-blue-600 whitespace-nowrap">{{ doc.vehicle?.code || '-' }}</td>
              <td class="px-3 py-2.5 font-bold font-mono whitespace-nowrap">{{ doc.vehicle?.plateNumber }} {{ doc.vehicle?.province }}</td>
              <td class="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{{ doc.docType }}</td>
              <td class="px-3 py-2.5 text-xs text-slate-600">{{ doc.docNumber || '-' }}</td>
              <td class="px-3 py-2.5 font-bold text-slate-900 whitespace-nowrap">{{ doc.expire || '-' }}</td>
              <td class="px-3 py-2.5 text-right font-medium whitespace-nowrap">฿{{ (doc.costAmount || 0).toLocaleString() }}</td>
              <td class="px-3 py-2.5 text-center whitespace-nowrap"><StatusBadge :days="doc.daysRemaining" /></td>
              <td class="px-3 py-2.5 text-xs text-slate-500">{{ doc.createdBy || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- -------------------------------------------------------------
        REPORT 3: OIL CHANGE HISTORY
        ------------------------------------------------------------- -->
    <div v-else-if="reportType === 'oil'" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none print:p-0">
      <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:bg-white print:px-0 print:py-1">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 print:text-sm">
          3. รายงานประวัติน้ำมันเครื่อง (ช่วง {{ startDate }} ถึง {{ endDate }})
        </h3>
        <span class="text-sm font-bold text-blue-700 print:text-xs">
          ยอดรวม: ฿{{ totalOilSpend.toLocaleString() }}
        </span>
      </div>
      <div class="overflow-x-auto print:overflow-visible">
        <table class="w-full text-left text-sm border-collapse min-w-[850px] print:min-w-0 print:w-full print:text-xs">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 print:bg-slate-100">
            <tr>
              <th class="px-3 py-2">วันที่</th>
              <th class="px-3 py-2">รถ / รหัส</th>
              <th class="px-3 py-2">ทะเบียน</th>
              <th class="px-3 py-2 text-right">เลขไมล์</th>
              <th class="px-3 py-2">รายการน้ำมัน / รายละเอียด</th>
              <th class="px-3 py-2 text-right">ค่าใช้จ่าย (บาท)</th>
              <th class="px-3 py-2">นัดถัดไป</th>
              <th class="px-3 py-2">ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="activeOil.length === 0">
              <td colspan="8" class="text-center py-8 text-slate-400">ไม่พบประวัติน้ำมันเครื่องในช่วงวันที่นี้</td>
            </tr>
            <tr v-else v-for="rec in activeOil" :key="rec.id" class="hover:bg-slate-50/80">
              <td class="px-3 py-2.5 font-medium whitespace-nowrap">{{ rec.changeDate }}</td>
              <td class="px-3 py-2.5 font-bold text-blue-600 whitespace-nowrap">{{ rec.vehicle?.code }}</td>
              <td class="px-3 py-2.5 font-mono font-bold whitespace-nowrap">{{ rec.vehicle?.plateNumber }} {{ rec.vehicle?.province }}</td>
              <td class="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{{ (rec.currentMileage || 0).toLocaleString() }} กม.</td>
              <td class="px-3 py-2.5">{{ rec.oilDetails }}</td>
              <td class="px-3 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">฿{{ (rec.cost || 0).toLocaleString() }}</td>
              <td class="px-3 py-2.5 text-xs whitespace-nowrap">{{ rec.nextChangeDate || '-' }}</td>
              <td class="px-3 py-2.5 text-xs text-slate-500">{{ rec.createdBy || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- -------------------------------------------------------------
        REPORT 4: MAINTENANCE HISTORY
        ------------------------------------------------------------- -->
    <div v-else-if="reportType === 'maintenance'" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden print:border-none print:shadow-none print:p-0">
      <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:bg-white print:px-0 print:py-1">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 print:text-sm">
          4. รายงานประวัติซ่อมบำรุง (ช่วง {{ startDate }} ถึง {{ endDate }})
        </h3>
        <span class="text-sm font-bold text-rose-600 print:text-xs">
          ยอดรวม: ฿{{ totalMntSpend.toLocaleString() }}
        </span>
      </div>
      <div class="overflow-x-auto print:overflow-visible">
        <table class="w-full text-left text-sm border-collapse min-w-[850px] print:min-w-0 print:w-full print:text-xs">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200 print:bg-slate-100">
            <tr>
              <th class="px-3 py-2">วันที่</th>
              <th class="px-3 py-2">รถ / รหัส</th>
              <th class="px-3 py-2">ทะเบียน</th>
              <th class="px-3 py-2 text-right">เลขไมล์</th>
              <th class="px-3 py-2">รายละเอียดการซ่อม</th>
              <th class="px-3 py-2">อู่ / ร้านซ่อม</th>
              <th class="px-3 py-2 text-right">ค่าใช้จ่าย (บาท)</th>
              <th class="px-3 py-2">ผู้บันทึก</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="activeMnt.length === 0">
              <td colspan="8" class="text-center py-8 text-slate-400">ไม่พบประวัติซ่อมบำรุงในช่วงวันที่นี้</td>
            </tr>
            <tr v-else v-for="rec in activeMnt" :key="rec.id" class="hover:bg-slate-50/80">
              <td class="px-3 py-2.5 font-medium whitespace-nowrap">{{ rec.repairDate }}</td>
              <td class="px-3 py-2.5 font-bold text-blue-600 whitespace-nowrap">{{ rec.vehicle?.code }}</td>
              <td class="px-3 py-2.5 font-mono font-bold whitespace-nowrap">{{ rec.vehicle?.plateNumber }} {{ rec.vehicle?.province }}</td>
              <td class="px-3 py-2.5 text-right font-semibold whitespace-nowrap">{{ (rec.mileage || 0).toLocaleString() }} กม.</td>
              <td class="px-3 py-2.5 font-semibold text-slate-900">{{ rec.description }}</td>
              <td class="px-3 py-2.5 text-slate-600">{{ rec.garage || '-' }}</td>
              <td class="px-3 py-2.5 text-right font-bold text-rose-600 whitespace-nowrap">
                ฿{{ (rec.cost || 0).toLocaleString() }}
              </td>
              <td class="px-3 py-2.5 text-xs text-slate-500">{{ rec.createdBy || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- -------------------------------------------------------------
        REPORT 5: EXPENSES SUMMARY BY DATE RANGE
        ------------------------------------------------------------- -->
    <div v-else-if="reportType === 'expenses'" class="space-y-5 print:space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 print:p-2.5 print:rounded-lg">
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 print:hidden">
            <ShieldCheck :size="20" />
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ค่าประกันภัย</span>
            <span class="text-lg font-bold text-slate-900 print:text-sm">฿{{ totalInsSpend.toLocaleString() }}</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 print:p-2.5 print:rounded-lg">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 print:hidden">
            <FileText :size="20" />
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ค่า พ.ร.บ. + ภาษี</span>
            <span class="text-lg font-bold text-slate-900 print:text-sm">฿{{ (totalPrbSpend + totalTaxSpend).toLocaleString() }}</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 print:p-2.5 print:rounded-lg">
          <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 print:hidden">
            <Droplet :size="20" />
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ค่าน้ำมันเครื่อง</span>
            <span class="text-lg font-bold text-slate-900 print:text-sm">฿{{ totalOilSpend.toLocaleString() }}</span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 print:p-2.5 print:rounded-lg">
          <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 print:hidden">
            <Wrench :size="20" />
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ค่าซ่อมบำรุง</span>
            <span class="text-lg font-bold text-slate-900 print:text-sm">฿{{ totalMntSpend.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:p-3 print:rounded-lg">
        <div>
          <h3 class="text-lg font-bold text-blue-900 print:text-sm">
            รวมค่าใช้จ่ายทั้งหมดในช่วงวันที่เลือก
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5 print:text-xs">
            ระหว่าง {{ startDate }} ถึง {{ endDate }} ({{ selectedVehicleId === 'all' ? 'รถทุกคันในร้าน' : 'รถที่เลือก' }})
          </p>
        </div>
        <div class="text-3xl font-extrabold text-blue-700 print:text-xl">
          ฿{{ grandTotalSpend.toLocaleString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Printer, 
  FileDown, 
  ShieldCheck, 
  Droplet, 
  Wrench, 
  Filter, 
  FileText 
} from 'lucide-vue-next';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import AppButton from '../components/AppButton.vue';

const reportType = ref('fleet'); // fleet, docs, oil, maintenance, expenses
const vehicles = ref([]);
const selectedVehicleId = ref('all');
const startDate = ref('2025-01-01');
const endDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(true);

const insuranceList = ref([]);
const prbList = ref([]);
const taxList = ref([]);
const oilList = ref([]);
const mntList = ref([]);

const printDate = computed(() => {
  const d = new Date();
  return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH')}`;
});

const loadAllData = async () => {
  try {
    loading.value = true;
    const [vRes, insRes, prbRes, taxRes, oilRes, mntRes] = await Promise.all([
      api.getVehicles(),
      api.getInsurance(),
      api.getPrb(),
      api.getTax(),
      api.getOilChanges(),
      api.getMaintenances()
    ]);
    if (vRes.success) vehicles.value = vRes.data;
    if (insRes.success) insuranceList.value = insRes.data;
    if (prbRes.success) prbList.value = prbRes.data;
    if (taxRes.success) taxList.value = taxRes.data;
    if (oilRes.success) oilList.value = oilRes.data;
    if (mntRes.success) mntList.value = mntRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAllData();
});

const handlePrint = () => {
  window.print();
};

const filterByVehicle = (list) => {
  if (selectedVehicleId.value === 'all') return list;
  return list.filter(item => item.vehicleId === selectedVehicleId.value);
};

const filterByDateRange = (list, dateField) => {
  return list.filter(item => {
    const d = item[dateField];
    if (!d) return false;
    return d >= startDate.value && d <= endDate.value;
  });
};

const activeVehicles = computed(() => {
  if (selectedVehicleId.value === 'all') return vehicles.value;
  return vehicles.value.filter(v => v.id === selectedVehicleId.value);
});

const activeOil = computed(() => {
  return filterByDateRange(filterByVehicle(oilList.value), 'changeDate');
});

const activeMnt = computed(() => {
  return filterByDateRange(filterByVehicle(mntList.value), 'repairDate');
});

const activeDocs = computed(() => {
  const all = [
    ...insuranceList.value.map(i => ({ ...i, docType: 'ประกันภัย', docNumber: i.policyNumber || i.company, expire: i.endDate, costAmount: i.premiumAmount })),
    ...prbList.value.map(p => ({ ...p, docType: 'พ.ร.บ.', docNumber: p.prbNumber, expire: p.endDate, costAmount: p.cost })),
    ...taxList.value.map(t => ({ ...t, docType: 'ภาษี/ต่อทะเบียน', docNumber: t.plateNumber, expire: t.expireDate, costAmount: t.cost }))
  ];
  return filterByVehicle(all);
});

const totalInsSpend = computed(() => {
  return filterByDateRange(filterByVehicle(insuranceList.value), 'startDate').reduce((s, i) => s + (Number(i.premiumAmount) || 0), 0);
});

const totalPrbSpend = computed(() => {
  return filterByDateRange(filterByVehicle(prbList.value), 'startDate').reduce((s, p) => s + (Number(p.cost) || 0), 0);
});

const totalTaxSpend = computed(() => {
  return filterByDateRange(filterByVehicle(taxList.value), 'lastRenewalDate').reduce((s, t) => s + (Number(t.cost) || 0), 0);
});

const totalOilSpend = computed(() => {
  return activeOil.value.reduce((s, o) => s + (Number(o.cost) || 0), 0);
});

const totalMntSpend = computed(() => {
  return activeMnt.value.reduce((s, m) => s + (Number(m.cost) || 0), 0);
});

const grandTotalSpend = computed(() => {
  return totalInsSpend.value + totalPrbSpend.value + totalTaxSpend.value + totalOilSpend.value + totalMntSpend.value;
});
</script>
