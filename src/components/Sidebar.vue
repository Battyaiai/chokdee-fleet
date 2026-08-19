<template>
  <div>
    <!-- Mobile Backdrop -->
    <div 
      v-if="isMobileOpen" 
      class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
      @click="emit('closeMobile')"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:shrink-0 print:hidden',
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Brand Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Truck :size="22" />
          </div>
          <div>
            <div class="font-bold text-base text-white tracking-tight leading-snug">โชคดีค้าข้าว</div>
            <div class="text-xs text-slate-400 font-normal">ระบบจัดการข้อมูลรถ</div>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button 
          class="p-1 text-slate-400 hover:text-white rounded-lg md:hidden hover:bg-slate-800" 
          @click="emit('closeMobile')" 
          type="button"
          title="ปิดเมนู"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- User Role Indicator Banner -->
      <div class="px-3 pt-3">
        <div 
          :class="[
            'p-2.5 rounded-lg text-xs flex items-center justify-between border',
            isAdmin 
              ? 'bg-blue-950/50 border-blue-800/80 text-blue-200' 
              : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
          ]"
        >
          <div class="flex items-center gap-2">
            <ShieldCheck v-if="isAdmin" :size="15" class="text-blue-400 shrink-0" />
            <User v-else :size="15" class="text-slate-400 shrink-0" />
            <span class="font-semibold">{{ isAdmin ? 'โหมดแอดมิน (Admin)' : 'ผู้ใช้งานทั่วไป (ดูอย่างเดียว)' }}</span>
          </div>
          <button 
            v-if="!isAdmin"
            class="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline"
            @click="isLoginModalOpen = true"
            type="button"
          >
            เข้าสู่ระบบ
          </button>
          <button 
            v-else
            class="text-[11px] font-medium text-rose-400 hover:text-rose-300 underline"
            @click="handleLogout"
            type="button"
          >
            ออก
          </button>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        <button
          v-for="item in visibleMenuItems"
          :key="item.id"
          :class="[
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 text-left select-none',
            currentView === item.id 
              ? 'bg-blue-600 text-white shadow-sm font-semibold' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          ]"
          @click="handleItemClick(item.id)"
          type="button"
        >
          <component :is="item.icon" :size="18" class="shrink-0" />
          <span class="flex-1 truncate">{{ item.label }}</span>
          <span 
            v-if="item.badge && item.badge > 0" 
            class="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-500 text-white shrink-0 shadow-xs"
          >
            {{ item.badge }}
          </span>
        </button>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1 bg-slate-950/40 shrink-0 mt-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ระบบออนไลน์</span>
          </div>
          <button 
            v-if="!isAdmin"
            class="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            @click="isLoginModalOpen = true"
          >
            <Lock :size="12" />
            <span>Admin PIN</span>
          </button>
        </div>
        <div class="text-slate-500">ร้านโชคดีค้าข้าว (CHOKDEE)</div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  Droplet, 
  Wrench, 
  Printer, 
  Settings,
  ShieldCheck,
  User,
  Lock,
  X
} from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
  currentView: {
    type: String,
    required: true
  },
  alertCount: {
    type: Number,
    default: 0
  },
  isMobileOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['navigate', 'closeMobile']);
const { isAdmin, isLoginModalOpen, logout } = useAuth();

const menuItems = [
  { id: 'dashboard', label: 'ภาพรวมระบบ', icon: LayoutDashboard },
  { id: 'vehicles', label: 'ข้อมูลรถยนต์', icon: Truck },
  { id: 'documents', label: 'เอกสารและวันหมดอายุ', icon: FileText, badge: props.alertCount },
  { id: 'oil', label: 'น้ำมันเครื่อง', icon: Droplet },
  { id: 'maintenance', label: 'ประวัติซ่อมบำรุง', icon: Wrench },
  { id: 'reports', label: 'รายงาน / พิมพ์', icon: Printer },
  { id: 'settings', label: 'ตั้งค่า & แจ้งเตือน LINE', icon: Settings, adminOnly: true }
];

const visibleMenuItems = computed(() => {
  return menuItems.filter(item => !item.adminOnly || isAdmin.value);
});

const handleItemClick = (id) => {
  emit('navigate', id);
  emit('closeMobile');
};

const handleLogout = () => {
  logout();
  if (props.currentView === 'settings') {
    emit('navigate', 'dashboard');
  }
};
</script>
