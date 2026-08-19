<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 font-sans antialiased">
    <!-- Sidebar Navigation -->
    <Sidebar 
      :currentView="currentView"
      :alertCount="alertCount"
      :isMobileOpen="isMobileMenuOpen"
      @navigate="handleNavigate"
      @closeMobile="isMobileMenuOpen = false"
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
      <!-- Header -->
      <Header 
        :title="currentHeader.title"
        :subtitle="currentHeader.subtitle"
        :alertCount="alertCount"
        @refresh="handleRefresh"
        @quickPrint="handleQuickPrint"
        @openMobile="isMobileMenuOpen = true"
      />

      <!-- Body Content Container -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 print:p-0 print:max-w-none">
        <DashboardView 
          v-if="currentView === 'dashboard'"
          :key="`dash-${refreshKey}`"
          @navigateToVehicle="handleSelectVehicle"
          @navigateToDocuments="currentView = 'documents'"
          @navigateToOil="currentView = 'oil'"
          @navigateToMaintenance="currentView = 'maintenance'"
        />

        <VehiclesView 
          v-else-if="currentView === 'vehicles'"
          :key="`veh-${refreshKey}-${selectedVehicleId}`"
          :selectedVehicleId="selectedVehicleId"
          @selectVehicle="handleSelectVehicle"
          @clearSelectedVehicle="selectedVehicleId = null"
        />

        <DocumentsView 
          v-else-if="currentView === 'documents'"
          :key="`doc-${refreshKey}`"
        />

        <OilChangeView 
          v-else-if="currentView === 'oil'"
          :key="`oil-${refreshKey}`"
        />

        <MaintenanceView 
          v-else-if="currentView === 'maintenance'"
          :key="`mnt-${refreshKey}`"
        />

        <ReportsView 
          v-else-if="currentView === 'reports'"
          :key="`rep-${refreshKey}`"
        />

        <SettingsView 
          v-else-if="currentView === 'settings'"
          :key="`set-${refreshKey}`"
          @dataReset="handleRefresh"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import DashboardView from './views/DashboardView.vue';
import VehiclesView from './views/VehiclesView.vue';
import DocumentsView from './views/DocumentsView.vue';
import OilChangeView from './views/OilChangeView.vue';
import MaintenanceView from './views/MaintenanceView.vue';
import ReportsView from './views/ReportsView.vue';
import SettingsView from './views/SettingsView.vue';
import { api } from './api';

const currentView = ref('dashboard');
const selectedVehicleId = ref(null);
const alertCount = ref(0);
const refreshKey = ref(0);
const isMobileMenuOpen = ref(false);

const fetchAlerts = async () => {
  try {
    const res = await api.getDashboardStats();
    if (res.success && res.data) {
      alertCount.value = res.data.totalAlerts || 0;
    }
  } catch (err) {
    console.error('Error fetching alerts:', err);
  }
};

onMounted(() => {
  fetchAlerts();
});

const handleNavigate = (view) => {
  if (view !== 'vehicles') {
    selectedVehicleId.value = null;
  }
  currentView.value = view;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSelectVehicle = (vehicleId) => {
  selectedVehicleId.value = vehicleId;
  currentView.value = 'vehicles';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleRefresh = () => {
  refreshKey.value += 1;
  fetchAlerts();
};

const handleQuickPrint = () => {
  if (currentView.value !== 'reports') {
    currentView.value = 'reports';
  } else {
    window.print();
  }
};

const viewHeaders = {
  dashboard: {
    title: 'แดชบอร์ดภาพรวมระบบ',
    subtitle: 'สรุปข้อมูลรถ เอกสารวันครบกำหนด ค่าใช้จ่าย และรายการแจ้งเตือนด่วน'
  },
  vehicles: {
    title: 'จัดการข้อมูลรถประจำร้าน',
    subtitle: 'รายชื่อรถ ยี่ห้อ รุ่น ทะเบียน และสถานะการใช้งาน'
  },
  documents: {
    title: 'เอกสารและวันครบกำหนด (ประกัน / พ.ร.บ. / ทะเบียน)',
    subtitle: 'บันทึกและติดตามวันหมดอายุ ประกันภัย พ.ร.บ. และภาษีประจำปี'
  },
  oil: {
    title: 'ประวัติการเปลี่ยนถ่ายน้ำมันเครื่อง',
    subtitle: 'บันทึกเลขไมล์ รายการน้ำมัน ค่าใช้จ่าย และนัดหมายรอบถัดไป'
  },
  maintenance: {
    title: 'ประวัติการซ่อมบำรุงและตรวจเช็ก',
    subtitle: 'บันทึกงานซ่อม อะไหล่ อู่บริการ ค่าใช้จ่าย และประวัติการบำรุงรักษา'
  },
  reports: {
    title: 'รายงานและพิมพ์เอกสาร (PDF / Print A4)',
    subtitle: 'พิมพ์สรุปข้อมูลรถ รายงานเอกสาร ประวัติซ่อม และสรุปค่าใช้จ่ายตามช่วงเวลา'
  },
  settings: {
    title: 'ตั้งค่าระบบ & แจ้งเตือนผ่าน LINE',
    subtitle: 'กำหนดเวลาแจ้งเตือนรายวัน คีย์เชื่อมต่อ LINE และตรวจสอบประวัติการส่ง'
  }
};

const currentHeader = computed(() => {
  if (currentView.value === 'vehicles' && selectedVehicleId.value) {
    return {
      title: 'รายละเอียดข้อมูลรถ',
      subtitle: 'ประวัติเอกสาร น้ำมันเครื่อง ซ่อมบำรุง และค่าใช้จ่ายคันนี้'
    };
  }
  return viewHeaders[currentView.value] || viewHeaders.dashboard;
});
</script>
