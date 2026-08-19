<template>
  <Modal
    :isOpen="isOpen"
    @close="emit('close')"
    title="เข้าสู่ระบบผู้ดูแลระบบ (Admin Mode)"
  >
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldAlert :size="18" class="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div class="font-bold text-blue-900">พื้นที่เฉพาะผู้ดูแลระบบ</div>
          <div class="mt-0.5 text-slate-600">
            กรุณากรอกรหัส PIN เพื่อปลดล็อกสิทธิ์ เพิ่ม แก้ไข ลบข้อมูลรถ และเข้าถึงเมนูตั้งค่าระบบ LINE
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">
          รหัสผ่าน PIN ผู้ดูแล <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <KeyRound :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            class="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs text-slate-900"
            v-model="pinInput"
            placeholder="กรอกรหัส PIN (ค่าเริ่มต้น: 8888)"
            autofocus
            required
          />
        </div>
        <span class="text-[11px] text-slate-400 block mt-1">
          💡 รหัสผ่านเริ่มต้นคือ: <code class="font-mono font-bold text-blue-700 bg-slate-100 px-1 py-0.5 rounded">8888</code>
        </span>
      </div>

      <div v-if="errorMsg" class="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
        <XCircle :size="15" class="shrink-0 text-rose-600" />
        <span>{{ errorMsg }}</span>
      </div>

      <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
        <AppButton variant="secondary" size="sm" type="button" @click="emit('close')">
          ยกเลิก
        </AppButton>
        <AppButton variant="primary" size="sm" type="submit">
          <span>เข้าสู่ระบบ Admin</span>
        </AppButton>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { KeyRound, ShieldAlert, XCircle } from 'lucide-vue-next';
import Modal from './Modal.vue';
import AppButton from './AppButton.vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'success']);

const { login } = useAuth();
const pinInput = ref('');
const errorMsg = ref('');

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    pinInput.value = '';
    errorMsg.value = '';
  }
});

const handleLogin = () => {
  const result = login(pinInput.value);
  if (result.success) {
    errorMsg.value = '';
    emit('success');
    emit('close');
  } else {
    errorMsg.value = result.message;
  }
};
</script>
