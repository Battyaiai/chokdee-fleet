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
          @renewDocument="handleRenewDocument"
        />

        <VehiclesView 
          v-else-if="currentView === 'vehicles'"
          :key="`veh-${refreshKey}-${selectedVehicleId}`"
          :selectedVehicleId="selectedVehicleId"
          @selectVehicle="handleSelectVehicle"
          @clearSelectedVehicle="selectedVehicleId = null"
          @renewDocument="handleRenewDocument"
        />

        <DocumentsView 
          v-else-if="currentView === 'documents'"
          :key="`doc-${refreshKey}`"
          :renewPayload="renewTarget"
          @clearRenewPayload="renewTarget = null"
          @documentSaved="handleRefresh"
        />

        <OilChangeView 
          v-else-if="currentView === 'oil'"
          :key="`oil-${refreshKey}`"
          :renewPayload="renewTarget"
          @clearRenewPayload="renewTarget = null"
          @recordSaved="handleRefresh"
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
          v-else-if="currentView === 'settings' && isAdmin"
          :key="`set-${refreshKey}`"
          @dataReset="handleRefresh"
        />
      </main>
    </div>

    <!-- Admin Login Modal -->
    <AdminLoginModal
      :isOpen="isLoginModalOpen"
      @close="isLoginModalOpen = false"
      @success="handleLoginSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';
import AdminLoginModal from './components/AdminLoginModal.vue';
import DashboardView from './views/DashboardView.vue';
import VehiclesView from './views/VehiclesView.vue';
import DocumentsView from './views/DocumentsView.vue';
import OilChangeView from './views/OilChangeView.vue';
import MaintenanceView from './views/MaintenanceView.vue';
import ReportsView from './views/ReportsView.vue';
import SettingsView from './views/SettingsView.vue';
import { api } from './api';
import { useAuth } from './composables/useAuth';

const currentView = ref('dashboard');
const selectedVehicleId = ref(null);
const renewTarget = ref(null);
const alertCount = ref(0);
const refreshKey = ref(0);
const isMobileMenuOpen = ref(false);

const { isAdmin, isLoginModalOpen } = useAuth();

const handleRenewDocument = (target) => {
  renewTarget.value = target;
  if (target?.type === 'oil') {
    currentView.value = 'oil';
  } else {
    currentView.value = 'documents';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Redirect to dashboard if logged out while on settings
watch(isAdmin, (newVal) => {
  if (!newVal && currentView.value === 'settings') {
    currentView.value = 'dashboard';
  }
});

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
  if (view === 'settings' && !isAdmin.value) {
    isLoginModalOpen.value = true;
    return;
  }
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

const handleLoginSuccess = () => {
  handleRefresh();
};

const handleQuickPrint = () => {
  if (currentView.value !== 'reports') {
    currentView.value = 'reports';
  } else {
    window.print();
  }
};

const currentHeader = computed(() => {
  switch (currentView.value) {
    case 'dashboard':
      return {
        title: 'ภาพรวมระบบยานพาหนะ (Dashboard)',
        subtitle: 'ร้านโชคดีค้าข้าว - สถานะรถ เอกสาร และการแจ้งเตือน'
      };
    case 'vehicles':
      return {
        title: selectedVehicleId.value ? 'ข้อมูลรายละเอียดรถและประวัติ' : 'รายการรถยนต์และยานพาหนะทั้งหมด',
        subtitle: 'จัดการข้อมูลพื้นฐาน เลขทะเบียน และประวัติประจำคัน'
      };
    case 'documents':
      return {
        title: 'ระบบติดตามเอกสารและวันครบกำหนด',
        subtitle: 'ประกันภัยภาคสมัครใจ, พ.ร.บ. และภาษีประจำปี'
      };
    case 'oil':
      return {
        title: 'ประวัติการเปลี่ยนถ่ายน้ำมันเครื่อง',
        subtitle: 'บันทึกเลขไมล์ วันที่เปลี่ยน และกำหนดรอบถัดไป'
      };
    case 'maintenance':
      return {
        title: 'บันทึกประวัติการซ่อมบำรุงและค่าใช้จ่าย',
        subtitle: 'ติดตามงานซ่อม อู่ที่เข้าซ่อม และค่าใช้จ่ายรวม'
      };
    case 'reports':
      return {
        title: 'รายงานสรุปและพิมพ์เอกสาร (A4 Report)',
        subtitle: 'พิมพ์รายงานข้อมูลรถ เอกสาร และค่าใช้จ่าย'
      };
    case 'settings':
      return {
        title: 'ตั้งค่าระบบ & เชื่อมต่อ LINE Notification',
        subtitle: 'พื้นที่เฉพาะผู้ดูแลระบบ (Admin Only)'
      };
    default:
      return { title: 'ระบบจัดการข้อมูลรถ', subtitle: 'ร้านโชคดีค้าข้าว' };
  }
});
</script>
