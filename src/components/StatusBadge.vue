<template>
  <!-- Vehicle Status Mode -->
  <span 
    v-if="type === 'vehicleStatus'" 
    :class="[
      'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-bold border whitespace-nowrap',
      status === 'active' 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-slate-100 text-slate-600 border-slate-200'
    ]"
  >
    <span :class="['w-2 h-2 rounded-full', status === 'active' ? 'bg-emerald-600' : 'bg-slate-400']"></span>
    {{ status === 'active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน' }}
  </span>

  <!-- Log Status Mode -->
  <span 
    v-else-if="type === 'logStatus'" 
    :class="[
      'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-bold border whitespace-nowrap',
      status === 'sent' 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-rose-50 text-rose-700 border-rose-200'
    ]"
  >
    <CheckCircle v-if="status === 'sent'" :size="15" class="text-emerald-600" />
    <AlertCircle v-else :size="15" class="text-rose-600" />
    {{ status === 'sent' ? 'ส่งแล้ว' : 'ส่งไม่สำเร็จ' }}
  </span>

  <!-- Days Remaining Expiry Mode -->
  <span v-else-if="days === null || days === undefined" class="inline-flex items-center px-3 py-1 rounded text-sm font-semibold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
    -
  </span>
  
  <span 
    v-else-if="days < 0" 
    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shadow-2xs" 
    :title="`หมดอายุไปแล้ว ${Math.abs(days)} วัน`"
  >
    <AlertCircle :size="15" class="text-rose-600 shrink-0" />
    <span>หมดอายุแล้ว ({{ Math.abs(days) }} วัน)</span>
  </span>

  <span 
    v-else-if="days === 0" 
    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse whitespace-nowrap shadow-2xs"
  >
    <AlertCircle :size="15" class="text-rose-600 shrink-0" />
    <span>หมดอายุวันนี้!</span>
  </span>

  <span 
    v-else-if="days <= 7" 
    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap shadow-2xs" 
    title="ด่วนมาก เหลือเวลาไม่เกิน 7 วัน"
  >
    <AlertTriangle :size="15" class="text-orange-600 shrink-0" />
    <span>เหลือ {{ days }} วัน (ด่วน)</span>
  </span>

  <span 
    v-else-if="days <= 30" 
    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shadow-2xs"
  >
    <Clock :size="15" class="text-amber-600 shrink-0" />
    <span>เหลือ {{ days }} วัน</span>
  </span>

  <span 
    v-else-if="days <= 60" 
    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shadow-2xs"
  >
    <Clock :size="15" class="text-amber-600 shrink-0" />
    <span>เหลือ {{ days }} วัน (ใกล้ครบ)</span>
  </span>

  <span 
    v-else 
    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shadow-2xs"
  >
    <CheckCircle :size="15" class="text-emerald-600 shrink-0" />
    <span>ปกติ (เหลือ {{ days }} วัน)</span>
  </span>
</template>

<script setup>
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-vue-next';

defineProps({
  days: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'days' // 'days' | 'vehicleStatus' | 'logStatus'
  }
});
</script>
