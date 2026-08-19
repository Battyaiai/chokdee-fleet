<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-lg focus:outline-none select-none',
      sizeClasses[size] || sizeClasses.md,
      variantClasses[variant] || variantClasses.primary,
      (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      customClass
    ]"
    @click="emit('click', $event)"
  >
    <!-- Loading Spinner -->
    <svg 
      v-if="loading" 
      class="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary' // 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5'
};

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-2 focus:ring-slate-400 focus:ring-offset-1',
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus:ring-2 focus:ring-rose-500 focus:ring-offset-1',
  success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900'
};
</script>
