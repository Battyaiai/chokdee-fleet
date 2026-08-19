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
        <h1 class="text-lg sm:text-xl font-bold text-slate-900 truncate leading-tight">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
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
        class="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"
      >
        <Bell :size="14" class="text-orange-600" />
        <span>มี {{ alertCount }} รายการใกล้ครบกำหนด</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Bell, RefreshCw, Printer, Menu } from 'lucide-vue-next';
import AppButton from './AppButton.vue';

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
</script>
