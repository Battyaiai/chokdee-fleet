<template>
  <header class="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs print:hidden">
    <div class="flex items-center gap-3 min-w-0">
      <!-- Mobile Hamburger Menu Button -->
      <button 
        class="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden shrink-0" 
        @click="emit('openMobile')" 
        type="button"
        title="เปิดเมนูหลัก"
      >
        <Menu :size="22" />
      </button>

      <!-- Page Title & Subtitle -->
      <div class="min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-lg sm:text-xl font-bold text-slate-900 truncate leading-tight">
            {{ title }}
          </h1>
          <span 
            :class="[
              'px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1',
              isAdmin 
                ? 'bg-blue-50 text-blue-800 border-blue-200' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            ]"
          >
            <ShieldCheck v-if="isAdmin" :size="13" class="text-blue-600" />
            <Eye v-else :size="13" class="text-slate-500" />
            <span>{{ isAdmin ? 'โหมดผู้ดูแล (Admin)' : 'โหมดดูอย่างเดียว' }}</span>
          </span>
        </div>
        <p v-if="subtitle" class="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <!-- Cloud Sync Status / Trigger Button -->
      <button 
        type="button"
        @click="handleCloudSync"
        :disabled="isSyncing"
        :title="lastMessage || 'ซิงก์ข้อมูลขึ้นคลาวด์อัตโนมัติ (GitHub)'"
        :class="[
          'px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-2xs',
          isSyncing 
            ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse' 
            : syncStatus === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
        ]"
      >
        <CloudUpload v-if="!isSyncing" :size="14" :class="syncStatus === 'error' ? 'text-rose-600' : 'text-emerald-600'" />
        <RefreshCw v-else :size="14" class="animate-spin text-amber-600" />
        <span class="hidden md:inline">
          {{ isSyncing ? 'กำลังซิงก์คลาวด์...' : syncStatus === 'error' ? 'ซิงก์ขัดข้อง' : 'คลาวด์ซิงก์แล้ว ☁️' }}
        </span>
      </button>

      <!-- Admin Login / Logout Button -->
      <AppButton 
        v-if="!isAdmin"
        variant="secondary" 
        size="sm"
        @click="isLoginModalOpen = true" 
        title="เข้าสู่ระบบ Admin เพื่อแก้ไขข้อมูล"
      >
        <Lock :size="14" />
        <span class="hidden sm:inline">เข้าสู่ระบบ Admin</span>
      </AppButton>
      <AppButton 
        v-else
        variant="secondary" 
        size="sm"
        @click="logout" 
        title="ออกจากระบบ Admin"
      >
        <LogOut :size="14" class="text-rose-600" />
        <span class="hidden sm:inline text-rose-700 font-semibold">ออกจาก Admin</span>
      </AppButton>

      <!-- Quick Print Button -->
      <AppButton 
        v-if="showQuickPrint" 
        variant="secondary" 
        size="sm"
        @click="emit('quickPrint')" 
        title="สั่งพิมพ์รายงาน"
      >
        <Printer :size="15" />
        <span class="hidden sm:inline">พิมพ์</span>
      </AppButton>

      <!-- Refresh Button -->
      <AppButton 
        variant="secondary" 
        size="sm"
        @click="emit('refresh')" 
        title="รีเฟรชข้อมูล"
      >
        <RefreshCw :size="15" />
        <span class="hidden sm:inline">รีเฟรช</span>
      </AppButton>

      <!-- Alert Count Badge -->
      <div 
        v-if="alertCount > 0" 
        class="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"
      >
        <Bell :size="14" class="text-orange-600" />
        <span>มี {{ alertCount }} รายการเตือน</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { Bell, RefreshCw, Printer, Menu, Lock, LogOut, ShieldCheck, Eye, CloudUpload } from 'lucide-vue-next';
import AppButton from './AppButton.vue';
import { useAuth } from '../composables/useAuth';
import { useCloudSync } from '../composables/useCloudSync';

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  alertCount: {
    type: Number,
    default: 0
  },
  showQuickPrint: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['refresh', 'quickPrint', 'openMobile']);
const { isAdmin, isLoginModalOpen, logout } = useAuth();
const { syncStatus, lastMessage, isSyncing, triggerSync, startPolling, stopPolling } = useCloudSync();

const handleCloudSync = async () => {
  await triggerSync('Manual Sync from Header');
};

onMounted(() => {
  startPolling(15000);
});

onUnmounted(() => {
  stopPolling();
});
</script>
