<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      @click="emit('close')"
    >
      <div 
        class="relative w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all duration-200"
        :style="{ maxWidth: maxWidth }" 
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {{ title }}
          </h3>
          <button 
            class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            @click="emit('close')" 
            title="ปิดหน้าต่าง" 
            type="button"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Modal Body & Content -->
        <div class="p-5 sm:p-6 overflow-y-auto space-y-4">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '640px'
  }
});

const emit = defineEmits(['close']);

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

watch(() => props.isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = 'unset';
});
</script>
