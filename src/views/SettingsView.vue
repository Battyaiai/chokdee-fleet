<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings class="text-blue-600" />
          <span>การตั้งค่าระบบ (System Settings)</span>
        </h2>
        <p class="text-sm text-slate-500 mt-1">
          กำหนดค่าการแจ้งเตือน LINE, จัดการความปลอดภัย, ซิงก์ข้อมูลคลาวด์ และรายชื่อผู้บันทึกข้อมูล
        </p>
      </div>
    </div>

    <!-- 1. LINE Setup Instructions Banner -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 sm:p-6 space-y-4">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <BellRing :size="20" />
        </div>
        <div>
          <h3 class="text-base font-bold text-blue-950">
            วิธีตั้งค่า LINE Notify / LINE Bot เข้ากลุ่มร้านโชคดีค้าข้าว
          </h3>
          <p class="text-xs text-blue-800/80 mt-0.5">
            ทำตาม 3 ขั้นตอนง่ายๆ เพื่อให้ระบบส่งแจ้งเตือนเตือนภาษี พ.ร.บ. ประกันภัย และเปลี่ยนน้ำมันเครื่องอัตโนมัติ
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div class="bg-white p-4 rounded-lg border border-blue-100 space-y-1.5 shadow-2xs">
          <div class="font-bold text-blue-800 flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
            สร้าง LINE Official Account หรือ Bot
          </div>
          <p class="text-slate-600 leading-relaxed">
            เข้าสู่ <a href="https://developers.line.biz/" target="_blank" class="text-blue-600 font-semibold underline">LINE Developers Console</a> สร้าง Provider และ Channel (Messaging API)
          </p>
        </div>

        <div class="bg-white p-4 rounded-lg border border-blue-100 space-y-1.5 shadow-2xs">
          <div class="font-bold text-blue-800 flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
            เชิญ LINE Bot เข้ากลุ่มทำงาน
          </div>
          <p class="text-slate-600 leading-relaxed">
            เปิด LINE ในมือถือ เพิ่มเพื่อน LINE Bot ที่สร้างไว้ แล้วกด <strong>"เชิญเข้ากลุ่ม LINE ที่ทำงาน"</strong> ของร้านโชคดีค้าข้าว
          </p>
        </div>

        <div class="bg-white p-4 rounded-lg border border-blue-100 space-y-1.5 shadow-2xs">
          <div class="font-bold text-blue-800 flex items-center gap-1.5">
            <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
            นำ Token & Group ID มาวาง
          </div>
          <p class="text-slate-600 leading-relaxed">
            คัดลอก <strong>Channel Access Token</strong> และ <strong>Group ID</strong> (ขึ้นต้นด้วย <code class="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono font-bold">C...</code>) มาใส่ในฟอร์มด้านล่างแล้วกดบันทึก
          </p>
        </div>
      </div>

      <div class="text-xs text-slate-500 bg-white/80 p-3 rounded-lg border border-blue-100 flex items-center gap-2">
        <Info :size="15" class="text-blue-600 shrink-0" />
        <span>ระบบจะบันทึกการตั้งค่าลงไฟล์ฐานข้อมูลของเซิร์ฟเวอร์ (<code class="font-mono text-slate-800 font-semibold">server/data/db.json</code>) ถาวร เมื่อปิดโปรแกรมหรือรีสตาร์ทเครื่องข้อมูลจะไม่สูญหาย</span>
      </div>
    </div>

    <!-- 2. Test Connection & Manual Scan Card -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span :class="['w-2.5 h-2.5 rounded-full', isConnected ? 'bg-emerald-500' : 'bg-slate-300']"></span>
          <h4 class="text-sm font-bold text-slate-900">
            สถานะการเชื่อมต่อ LINE Bot:
            <span :class="isConnected ? 'text-emerald-600 font-semibold' : 'text-slate-500 font-normal'">
              {{ isConnected ? 'พร้อมใช้งาน (เชื่อมต่อแล้ว)' : 'ยังไม่ได้เชื่อมต่อ Token' }}
            </span>
          </h4>
        </div>
        <p class="text-xs text-slate-500">
          ทดสอบส่งข้อความ หรือสั่งระบบสแกนเอกสารและส่งแจ้งเตือนทันทีโดยไม่ต้องรอรอบประจำวัน
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <AppButton 
          variant="secondary" 
          size="sm" 
          @click="handleTestSend" 
          :loading="testing"
        >
          <Send :size="14" />
          <span>ทดสอบส่ง LINE</span>
        </AppButton>

        <AppButton 
          variant="secondary" 
          size="sm" 
          @click="handleScanNow" 
          :loading="scanning"
        >
          <RotateCcw :size="14" />
          <span>สแกนแจ้งเตือนเดี๋ยวนี้</span>
        </AppButton>
      </div>
    </div>

    <!-- Test Result Message Box -->
    <div v-if="testResult" :class="['text-xs p-4 rounded-xl border flex items-start gap-3', testResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200']">
      <CheckCircle2 v-if="testResult.success" :size="18" class="shrink-0 text-emerald-600 mt-0.5" />
      <XCircle v-else :size="18" class="shrink-0 text-amber-600 mt-0.5" />
      <div class="space-y-1">
        <div class="font-bold">{{ testResult.success ? 'ผลการทดสอบสำเร็จ' : 'ผลการทดสอบแจ้งเตือน' }}</div>
        <div class="leading-relaxed">{{ testResult.message }}</div>
      </div>
    </div>

    <!-- 3. Settings Form -->
    <form @submit.prevent="handleSaveSettings" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-2">
          <Settings :size="18" class="text-blue-600" />
          <h3 class="text-base font-bold text-slate-900">
            ตั้งค่าการแจ้งเตือน LINE
          </h3>
        </div>
        <AppButton type="submit" variant="primary" size="sm" :loading="saving">
          บันทึกการตั้งค่า
        </AppButton>
      </div>

      <div class="p-5 sm:p-6 space-y-6">
        <!-- Section 1 -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. การเปิด/ปิด ระบบแจ้งเตือน
          </h4>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                v-model="settings.isEnabled"
              />
              <span class="text-sm font-bold text-slate-800">เปิดใช้งานระบบแจ้งเตือนอัตโนมัติผ่าน LINE</span>
            </label>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  v-model="settings.notifyInsurance"
                />
                <span>เตือน ประกันภัย</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  v-model="settings.notifyPrb"
                />
                <span>เตือน พ.ร.บ.</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  v-model="settings.notifyTax"
                />
                <span>เตือน ภาษีประจำปี</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  v-model="settings.notifyOil"
                />
                <span>เตือน เปลี่ยนน้ำมันเครื่อง</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Section 2 -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. เงื่อนไขและเวลากำหนดแจ้งเตือน
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                เวลาที่ต้องการให้ส่งแจ้งเตือน
              </label>
              <input
                type="time"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                v-model="settings.notifyTime"
              />
              <span class="text-2xs text-slate-400 mt-1 block">รอบสแกนประจำวัน</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                เตือนภาษีล่วงหน้า (วัน)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                v-model.number="settings.daysTaxBefore"
              />
              <span class="text-2xs text-slate-400 mt-1 block">ค่ามาตรฐาน: 90 วัน</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                เตือน พ.ร.บ. ล่วงหน้า (วัน)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                v-model.number="settings.daysPrbBefore"
              />
              <span class="text-2xs text-slate-400 mt-1 block">ค่ามาตรฐาน: 60 วัน</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                เตือนประกันภัยล่วงหน้า (วัน)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                v-model.number="settings.daysInsuranceBefore"
              />
              <span class="text-2xs text-slate-400 mt-1 block">ค่ามาตรฐาน: 60 วัน</span>
            </div>
          </div>
        </div>

        <!-- Section 3 -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            3. คีย์เชื่อมต่อ LINE Messaging API
          </h4>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Channel Access Token (Long-Lived)
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="settings.channelAccessToken"
                placeholder="วาง Channel Access Token ที่ได้จาก LINE Developers"
              />
              <span class="text-xs text-slate-500 block mt-1">
                กุญแจสำคัญสำหรับส่งข้อความ ได้จากหน้า LINE Developers (Messaging API) หรือ LINE Notify
              </span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                LINE Group ID หรือ User ID ผู้รับข้อความ <span class="text-slate-400 font-normal">(ไม่จำเป็นต้องใส่ หากใช้ LINE Notify)</span>
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="settings.userIdOrGroupId"
                placeholder="เช่น C1234567890abcdef... (Group ID) หรือ U1234567890abcdef... (User ID)"
              />
              <span class="text-xs text-slate-500 block mt-1">
                💡 <strong>ส่งเข้ากลุ่มที่ทำงาน:</strong> ใส่ Group ID ที่ขึ้นต้นด้วย <code class="font-mono text-blue-600 font-bold">C...</code> เพื่อส่งแจ้งเตือนเข้ากลุ่มที่ทุกคนในร้านอยู่ด้วยกัน
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- 4. Notification History Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 class="text-sm sm:text-base font-bold text-slate-900">
          ประวัติการส่งแจ้งเตือน LINE ({{ logs.length }} รายการ)
        </h3>
        <span class="text-xs text-slate-400">
          ป้องกันการส่งซ้ำในวันเดียวกันอัตโนมัติ
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse min-w-[800px]">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">วันที่และเวลา</th>
              <th class="px-5 py-3">ประเภท</th>
              <th class="px-5 py-3">รถ / ทะเบียน</th>
              <th class="px-5 py-3">รายละเอียดข้อความที่ส่ง</th>
              <th class="px-5 py-3">สถานะการส่ง</th>
              <th class="px-5 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="logs.length === 0">
              <td colspan="6" class="text-center py-8 text-slate-400">
                ยังไม่มีประวัติการส่งข้อความ
              </td>
            </tr>
            <tr 
              v-else 
              v-for="log in logs" 
              :key="log.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="font-semibold text-slate-800 text-xs">
                  {{ new Date(log.timestamp).toLocaleDateString('th-TH') }}
                </div>
                <div class="text-xs text-slate-400">
                  {{ new Date(log.timestamp).toLocaleTimeString('th-TH') }}
                </div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap font-medium text-slate-800">
                {{ log.type === 'insurance' ? 'ประกันภัย' : log.type === 'tax' ? 'ต่อทะเบียน' : log.type === 'prb' ? 'พ.ร.บ.' : log.type === 'oil' ? 'น้ำมันเครื่อง' : 'ทดสอบ' }}
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                {{ log.vehiclePlate }}
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">
                <div>{{ log.details }}</div>
                <div v-if="log.errorMessage" class="text-rose-500 mt-0.5">({{ log.errorMessage }})</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <StatusBadge :status="log.status" type="logStatus" />
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-center">
                <AppButton 
                  variant="secondary" 
                  size="sm" 
                  @click="handleRetryLog(log.id)"
                  title="กดส่งข้อความนี้ซ้ำอีกครั้ง"
                >
                  <RotateCcw :size="12" />
                  <span>ส่งซ้ำ</span>
                </AppButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 5. Admin Security Section -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
        <KeyRound :size="18" class="text-blue-600" />
        <h4 class="text-base font-bold text-slate-900">
          ความปลอดภัยและรหัสผ่าน Admin PIN
        </h4>
      </div>

      <form @submit.prevent="handleChangePin" class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">รหัส PIN เดิม <span class="text-rose-500">*</span></label>
          <input
            type="password"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            v-model="oldPinInput"
            placeholder="รหัส PIN เดิม (ค่าเริ่มต้น: 8888)"
            required
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">รหัส PIN ใหม่ <span class="text-rose-500">*</span></label>
          <input
            type="password"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            v-model="newPinInput"
            placeholder="ตั้งรหัส PIN ใหม่ (อย่างน้อย 4 ตัว)"
            required
          />
        </div>
        <div>
          <AppButton type="submit" variant="primary" size="md">
            <span>เปลี่ยนรหัส PIN</span>
          </AppButton>
        </div>
      </form>
      <div v-if="pinFeedback" :class="['text-xs p-2.5 rounded-lg border', pinFeedback.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200']">
        {{ pinFeedback.message }}
      </div>
    </div>

    <!-- 6. Cloud Auto-Sync Section -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CloudUpload :size="20" />
          </div>
          <div>
            <h4 class="text-base font-bold text-slate-900 leading-tight">
              ระบบซิงก์ข้อมูลคลาวด์อัตโนมัติ (Cloud Auto-Sync)
            </h4>
            <p class="text-xs text-slate-500 mt-0.5">
              อัปเดตและสำรองข้อมูลขึ้น GitHub และระบบคลาวด์อัตโนมัติทุกครั้งที่มีการกดบันทึกหรือแก้ไขข้อมูล
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <AppButton 
            variant="primary" 
            size="sm" 
            @click="handleManualSync"
            :loading="isSyncing"
          >
            <CloudUpload :size="14" />
            <span>ซิงก์ขึ้นคลาวด์เดี๋ยวนี้ (Sync Now)</span>
          </AppButton>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
          <div class="text-xs text-slate-500 font-medium">สถานะการทำงาน</div>
          <div class="flex items-center gap-2">
            <span 
              :class="[
                'w-2.5 h-2.5 rounded-full',
                isSyncing ? 'bg-amber-500 animate-ping' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
              ]"
            />
            <span class="text-xs sm:text-sm font-bold text-slate-800">
              {{ isSyncing ? 'กำลังซิงก์ข้อมูล...' : syncStatus === 'error' ? 'การซิงก์ขัดข้อง' : '🟢 ซิงก์อัตโนมัติตลอดเวลา' }}
            </span>
          </div>
        </div>

        <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
          <div class="text-xs text-slate-500 font-medium">ซิงก์ล่าสุดเมื่อ</div>
          <div class="text-xs sm:text-sm font-bold text-slate-800">
            {{ lastSyncTime ? new Date(lastSyncTime).toLocaleString('th-TH') : 'พร้อมใช้งาน' }}
          </div>
        </div>

        <div class="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
          <div class="text-xs text-slate-500 font-medium">Cloud Repository</div>
          <div class="text-xs font-mono font-semibold text-blue-700 truncate" title="https://github.com/Battyaiai/chokdee-fleet">
            Battyaiai/chokdee-fleet (main)
          </div>
        </div>
      </div>

      <div v-if="syncFeedback" :class="['text-xs p-3 rounded-lg border flex items-center gap-2', syncFeedback.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200']">
        <CheckCircle2 v-if="syncFeedback.success" :size="15" class="shrink-0 text-emerald-600" />
        <XCircle v-else :size="15" class="shrink-0 text-rose-600" />
        <span>{{ syncFeedback.message }}</span>
      </div>
    </div>

    <!-- 7. Staff Management Section -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users :size="18" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 leading-tight">
              จัดการรายชื่อผู้บันทึกข้อมูล (Recorder Staff)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              เพิ่ม/แก้ไขรายชื่อและตำแหน่งพนักงานสำหรับเลือกในแบบฟอร์มบันทึก
            </p>
          </div>
        </div>

        <AppButton variant="primary" size="sm" @click="handleOpenAddStaff">
          <UserPlus :size="14" />
          <span>เพิ่มรายชื่อผู้บันทึก</span>
        </AppButton>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">ชื่อ - นามสกุล</th>
              <th class="px-5 py-3">ตำแหน่ง / แผนก</th>
              <th class="px-5 py-3 text-center">ค่าเริ่มต้น</th>
              <th class="px-5 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="staffList.length === 0">
              <td colspan="4" class="text-center py-6 text-slate-400">
                ยังไม่มีรายชื่อผู้บันทึกข้อมูล
              </td>
            </tr>
            <tr 
              v-else 
              v-for="s in staffList" 
              :key="s.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-2.5 font-semibold text-slate-900">
                  <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {{ s.name.charAt(0) }}
                  </div>
                  <span>{{ s.name }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {{ s.role || 'ไม่ระบุตำแหน่ง' }}
                </span>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-center">
                <span 
                  v-if="s.isDefault" 
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                >
                  <Star :size="12" class="fill-amber-500 text-amber-500" />
                  <span>ค่าเริ่มต้น</span>
                </span>
                <button 
                  v-else
                  @click="handleSetDefaultStaff(s.id)"
                  class="text-xs text-slate-400 hover:text-blue-600 hover:underline font-medium transition-colors"
                  title="คลิกเพื่อตั้งคนนี้เป็นค่าเริ่มต้นที่เลือกอัตโนมัติ"
                >
                  ตั้งเป็นค่าเริ่มต้น
                </button>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-center">
                <div class="inline-flex items-center gap-1">
                  <button 
                    class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    @click="handleOpenEditStaff(s)"
                    title="แก้ไขรายชื่อ"
                  >
                    <Edit2 :size="14" />
                  </button>
                  <button 
                    v-if="staffList.length > 1"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    @click="handleDeleteStaff(s.id)"
                    title="ลบรายชื่อ"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 8. Danger Zone / Reset -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h4 class="text-sm font-bold text-slate-900">
          รีเซ็ตข้อมูลตัวอย่างร้านโชคดีค้าข้าว
        </h4>
        <p class="text-xs text-slate-500">
          หากต้องการคืนค่าข้อมูลเริ่มต้น (รถบรรทุก 10 ล้อ, 6 ล้อ, กระบะตู้ทึบ, รถตรวจงาน) สามารถกดรีเซ็ตได้
        </p>
      </div>
      <AppButton variant="secondary" size="sm" @click="handleResetData">
        <Database :size="14" />
        <span>คืนค่าข้อมูลตัวอย่าง</span>
      </AppButton>
    </div>

    <!-- Staff Add / Edit Modal -->
    <Modal
      :isOpen="isStaffModalOpen"
      @close="isStaffModalOpen = false"
      :title="editingStaffId ? 'แก้ไขข้อมูลผู้บันทึก' : 'เพิ่มรายชื่อผู้บันทึกใหม่'"
    >
      <form @submit.prevent="handleSaveStaff" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล <span class="text-rose-500">*</span></label>
          <input
            type="text"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            v-model="staffFormData.name"
            placeholder="เช่น พัควลัญชญ์ อุไรล้ำ"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่ง / แผนก</label>
          <input
            type="text"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            v-model="staffFormData.role"
            placeholder="เช่น พนักงานไอที, หัวหน้าคลัง, ธุรการ, ช่างประจำร้าน"
          />
        </div>

        <div class="pt-1">
          <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              v-model="staffFormData.isDefault"
            />
            <span>ตั้งเป็นผู้บันทึกค่าเริ่มต้น (เลือกอัตโนมัติเมื่อเปิดฟอร์มใหม่)</span>
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <AppButton variant="secondary" @click="isStaffModalOpen = false">
            ยกเลิก
          </AppButton>
          <AppButton type="submit" variant="primary" :loading="savingStaff">
            {{ savingStaff ? 'กำลังบันทึก...' : 'บันทึกรายชื่อ' }}
          </AppButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Settings, 
  Send, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  BellRing,
  Database,
  Users,
  Info,
  KeyRound,
  CloudUpload,
  UserPlus,
  Star,
  Edit2,
  Trash2
} from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';
import { useCloudSync } from '../composables/useCloudSync';
import { useStaff } from '../composables/useStaff';
import Modal from '../components/Modal.vue';
import StatusBadge from '../components/StatusBadge.vue';
import AppButton from '../components/AppButton.vue';
import { api } from '../api';

const emit = defineEmits(['dataReset']);

const { updatePin } = useAuth();
const { syncStatus, lastSyncTime, isSyncing, triggerSync, fetchStatus } = useCloudSync();
const { staffList, loadStaff, addStaff, updateStaff, deleteStaff, setDefaultStaff } = useStaff();

const oldPinInput = ref('');
const newPinInput = ref('');
const pinFeedback = ref(null);
const syncFeedback = ref(null);

// Staff Modal State
const isStaffModalOpen = ref(false);
const editingStaffId = ref(null);
const savingStaff = ref(false);
const staffFormData = ref({
  name: '',
  role: '',
  isDefault: false
});

const handleOpenAddStaff = () => {
  editingStaffId.value = null;
  staffFormData.value = {
    name: '',
    role: '',
    isDefault: staffList.value.length === 0
  };
  isStaffModalOpen.value = true;
};

const handleOpenEditStaff = (staff) => {
  editingStaffId.value = staff.id;
  staffFormData.value = {
    name: staff.name || '',
    role: staff.role || '',
    isDefault: Boolean(staff.isDefault)
  };
  isStaffModalOpen.value = true;
};

const handleSaveStaff = async () => {
  if (!staffFormData.value.name.trim()) {
    alert('กรุณากรอกชื่อผู้บันทึก');
    return;
  }
  try {
    savingStaff.value = true;
    if (editingStaffId.value) {
      await updateStaff(editingStaffId.value, staffFormData.value);
    } else {
      await addStaff(staffFormData.value);
    }
    isStaffModalOpen.value = false;
    await loadStaff(true);
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึกรายชื่อ: ' + err.message);
  } finally {
    savingStaff.value = false;
  }
};

const handleDeleteStaff = async (id) => {
  if (!window.confirm('คุณต้องการลบรายชื่อผู้บันทึกนี้ใช่หรือไม่?')) return;
  try {
    await deleteStaff(id);
    await loadStaff(true);
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการลบ: ' + err.message);
  }
};

const handleSetDefaultStaff = async (id) => {
  try {
    await setDefaultStaff(id);
    await loadStaff(true);
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  }
};

const handleManualSync = async () => {
  syncFeedback.value = null;
  const result = await triggerSync('Manual Sync from Settings View');
  syncFeedback.value = result;
};

const handleChangePin = () => {
  const result = updatePin(oldPinInput.value, newPinInput.value);
  pinFeedback.value = result;
  if (result.success) {
    oldPinInput.value = '';
    newPinInput.value = '';
  }
};

const settings = ref({
  isEnabled: true,
  channelAccessToken: '',
  userIdOrGroupId: '',
  notifyInsurance: true,
  notifyPrb: true,
  notifyTax: true,
  notifyOil: true,
  notifyMaintenance: true,
  notifyTime: '08:00',
  daysInsuranceBefore: 60,
  daysTaxBefore: 90,
  daysPrbBefore: 60,
  hasToken: false
});

const logs = ref([]);
const loading = ref(true);
const testing = ref(false);
const scanning = ref(false);
const saving = ref(false);
const testResult = ref(null);

const loadSettingsAndLogs = async () => {
  try {
    loading.value = true;
    const [sRes, lRes] = await Promise.all([
      api.getLineSettings(),
      api.getLineLogs()
    ]);
    if (sRes.success) settings.value = sRes.data;
    if (lRes.success) logs.value = lRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSettingsAndLogs();
});

const isConnected = computed(() => {
  return settings.value.hasToken || Boolean(settings.value.channelAccessToken);
});

const handleSaveSettings = async () => {
  try {
    saving.value = true;
    await api.updateLineSettings(settings.value);
    alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    await loadSettingsAndLogs();
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
  } finally {
    saving.value = false;
  }
};

const handleTestSend = async () => {
  try {
    testing.value = true;
    testResult.value = null;
    const res = await api.testLine();
    if (res.result?.success) {
      testResult.value = {
        success: true,
        message: '🟢 ส่งข้อความทดสอบไปยัง LINE สำเร็จเรียบร้อยแล้ว! (ข้อความเด้งเข้า LINE แล้ว)'
      };
    } else if (res.result?.simulated) {
      testResult.value = {
        success: false,
        message: '⚠️ ยังไม่ถึง LINE จริง: เนื่องจากยังไม่ได้ใส่ Channel Access Token (ตัวยาว) หรือยังไม่ได้ใส่ Group ID กรุณานำ Token จาก LINE Developers มาใส่ในแบบฟอร์มด้านล่างแล้วกด "บันทึกการตั้งค่า" ก่อนครับ'
      };
    } else {
      testResult.value = {
        success: false,
        message: `🔴 LINE API แจ้งเตือนข้อผิดพลาด: ${res.result?.error || 'ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบ Token และ Group ID'}`
      };
    }
    await loadSettingsAndLogs();
  } catch (err) {
    testResult.value = {
      success: false,
      message: 'ส่งไม่สำเร็จ: ' + err.message
    };
  } finally {
    testing.value = false;
  }
};

const handleScanNow = async () => {
  try {
    scanning.value = true;
    const res = await api.scanAndNotifyLine(true);
    if (res.success) {
      alert(`ตรวจสอบและประมวลผลสำเร็จ!\nตรวจพบและส่งแจ้งเตือน: ${res.data.sent} รายการ`);
      await loadSettingsAndLogs();
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาด: ' + err.message);
  } finally {
    scanning.value = false;
  }
};

const handleRetryLog = async (logId) => {
  try {
    const res = await api.retryLineLog(logId);
    if (res.success) {
      alert('ส่งซ้ำเรียบร้อยแล้ว');
      await loadSettingsAndLogs();
    }
  } catch (err) {
    alert('ส่งซ้ำไม่สำเร็จ: ' + err.message);
  }
};

const handleResetData = async () => {
  if (window.confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดของร้านโชคดีค้าข้าวกลับสู่ค่าเริ่มต้นใช่หรือไม่?')) {
    try {
      await api.resetSeedData();
      alert('รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว');
      emit('dataReset');
      await loadSettingsAndLogs();
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  }
};
</script>
