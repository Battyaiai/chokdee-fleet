<template>
  <div class="space-y-6">
    <!-- Sub Tabs -->
    <div class="flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar">
      <button 
        :class="[
          'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
          activeDocTab === 'insurance' 
            ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
        ]"
        @click="activeDocTab = 'insurance'"
        type="button"
      >
        <ShieldCheck :size="18" />
        <span>ประกันภัยรถ ({{ insuranceList.length }})</span>
        <span class="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
          เตือน 2 เดือน
        </span>
      </button>

      <button 
        :class="[
          'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
          activeDocTab === 'prb' 
            ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
        ]"
        @click="activeDocTab = 'prb'"
        type="button"
      >
        <FileText :size="18" />
        <span>พ.ร.บ. ({{ prbList.length }})</span>
        <span class="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-800">
          เตือน 2 เดือน
        </span>
      </button>

      <button 
        :class="[
          'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
          activeDocTab === 'tax' 
            ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
        ]"
        @click="activeDocTab = 'tax'"
        type="button"
      >
        <FileCheck :size="18" />
        <span>ต่อทะเบียนรถ ({{ taxList.length }})</span>
        <span class="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
          เตือน 3 เดือน
        </span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          class="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-xs"
          placeholder="ค้นหาทะเบียน, บริษัท, เลขที่เอกสาร..."
          v-model="searchTerm"
        />
      </div>

      <!-- Filters & Add Button -->
      <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <select 
          class="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
          v-model="vehicleFilter"
        >
          <option value="all">เลือกรถทุกคัน</option>
          <option v-for="v in vehicles" :key="v.id" :value="v.id">
            {{ v.code }} - {{ v.plateNumber }} ({{ v.brand }})
          </option>
        </select>

        <select 
          class="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
          v-model="statusFilter"
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="urgent">ด่วนมาก (&lt; 7 วัน)</option>
          <option value="warning">ใกล้ครบกำหนด (&lt; 60 วัน)</option>
          <option value="expired">หมดอายุแล้ว</option>
          <option value="normal">ปกติ</option>
        </select>

        <AppButton v-if="isAdmin" variant="primary" size="md" @click="handleOpenAdd">
          <Plus :size="16" />
          <span class="whitespace-nowrap">
            {{ activeDocTab === 'insurance' ? 'บันทึกประกันใหม่' : activeDocTab === 'prb' ? 'บันทึก พ.ร.บ. ใหม่' : 'บันทึกต่อทะเบียนใหม่' }}
          </span>
        </AppButton>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <!-- 1. Insurance Table -->
      <div v-if="activeDocTab === 'insurance'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 text-base font-bold text-slate-800 border-b border-slate-200">
            <tr>
              <th class="px-5 py-4 min-w-[200px]">รถ / รหัส</th>
              <th class="px-5 py-4 whitespace-nowrap">ทะเบียน</th>
              <th class="px-5 py-4 min-w-[180px]">บริษัทประกัน</th>
              <th class="px-5 py-4 whitespace-nowrap">เลขกรมธรรม์</th>
              <th class="px-5 py-4 whitespace-nowrap">วันที่เริ่ม</th>
              <th class="px-5 py-4 whitespace-nowrap">วันหมดประกัน</th>
              <th class="px-5 py-4 text-right whitespace-nowrap">ค่าเบี้ย (บาท)</th>
              <th class="px-5 py-4 text-center whitespace-nowrap">สถานะวันหมดอายุ</th>
              <th v-if="isAdmin" class="px-5 py-4 text-center whitespace-nowrap w-24">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredInsurance.length === 0">
              <td :colspan="isAdmin ? 9 : 8" class="text-center py-12 text-slate-400 text-base">ไม่พบข้อมูลประกันภัยตามเงื่อนไข</td>
            </tr>
            <tr 
              v-else 
              v-for="ins in filteredInsurance" 
              :key="ins.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-4.5 align-top max-w-[240px]">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-blue-600 text-lg">{{ ins.vehicle?.code || '-' }}</span>
                  <span v-if="ins.vehicle?.name" class="font-bold text-blue-900 text-base bg-blue-100/90 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                    {{ ins.vehicle.name }}
                  </span>
                </div>
                <div class="text-base font-bold text-slate-800 mt-1 leading-snug break-words">{{ ins.vehicle?.brand }} {{ ins.vehicle?.model }}</div>
                <div v-if="ins.vehicle?.vin || ins.vehicle?.engineNo" class="text-xs text-slate-600 font-mono mt-1.5 space-y-0.5 leading-tight">
                  <div v-if="ins.vehicle?.vin" class="break-words" :title="'เลขตัวรถ: ' + ins.vehicle.vin">
                    <span class="text-slate-400 font-sans font-medium">คัสซี:</span> <span class="font-bold text-slate-800">{{ ins.vehicle.vin }}</span>
                  </div>
                  <div v-if="ins.vehicle?.engineNo" class="break-words" :title="'เลขเครื่องยนต์: ' + ins.vehicle.engineNo">
                    <span class="text-slate-400 font-sans font-medium">เครื่อง:</span> <span class="font-bold text-slate-800">{{ ins.vehicle.engineNo }}</span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap align-top">
                <div class="inline-block font-mono font-black text-lg bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs leading-tight">
                  {{ ins.vehicle?.plateNumber }}
                </div>
                <div class="text-sm font-bold text-slate-500 mt-1">
                  {{ ins.vehicle?.province }}
                </div>
              </td>
              <td class="px-5 py-4.5 align-top">
                <div class="font-bold text-slate-900 text-base">{{ ins.company || '-' }}</div>
                <div class="text-sm font-semibold text-blue-600 mt-0.5">{{ ins.insuranceType || '-' }}</div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap font-mono text-base font-bold text-slate-800 align-top">{{ ins.policyNumber || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-base font-medium text-slate-600 align-top">{{ ins.startDate || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap font-bold text-base text-slate-900 align-top">{{ ins.endDate || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-right font-black text-xl text-slate-900 align-top">฿{{ (ins.premiumAmount || 0).toLocaleString() }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-center align-top"><StatusBadge :days="ins.daysRemaining" /></td>
              <td v-if="isAdmin" class="px-5 py-4.5 whitespace-nowrap text-center align-top">
                <div class="inline-flex items-center gap-1.5 pt-0.5">
                  <button 
                    class="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-200 text-xs font-semibold flex items-center gap-1 shadow-2xs" 
                    @click="handleRenew(ins, 'insurance')" 
                    title="ต่ออายุกรมธรรม์ใหม่อีก 1 ปี (สร้างรายการใหม่)" 
                    type="button"
                  >
                    <Sparkles :size="13" class="text-amber-500" />
                    <span>ต่ออายุ</span>
                  </button>
                  <button class="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 hover:border-blue-300" @click="handleOpenEdit(ins)" title="แก้ไข" type="button">
                    <Edit2 :size="16" />
                  </button>
                  <button class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-300" @click="handleDelete(ins.id)" title="ลบ" type="button">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. PRB Table -->
      <div v-else-if="activeDocTab === 'prb'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 text-base font-bold text-slate-800 border-b border-slate-200">
            <tr>
              <th class="px-5 py-4 min-w-[200px]">รถ / รหัส</th>
              <th class="px-5 py-4 whitespace-nowrap">ทะเบียน / จังหวัด</th>
              <th class="px-5 py-4 whitespace-nowrap">เลขที่ พ.ร.บ.</th>
              <th class="px-5 py-4 whitespace-nowrap">วันเริ่มคุ้มครอง</th>
              <th class="px-5 py-4 whitespace-nowrap">วันสิ้นสุด (หมดอายุ)</th>
              <th class="px-5 py-4 text-right whitespace-nowrap">ค่า พ.ร.บ. (บาท)</th>
              <th class="px-5 py-4 text-center whitespace-nowrap">สถานะวันหมดอายุ</th>
              <th v-if="isAdmin" class="px-5 py-4 text-center whitespace-nowrap w-28">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredPrb.length === 0">
              <td :colspan="isAdmin ? 8 : 7" class="text-center py-12 text-slate-400 text-base">ไม่พบข้อมูล พ.ร.บ. ตามเงื่อนไข</td>
            </tr>
            <tr 
              v-else 
              v-for="prb in filteredPrb" 
              :key="prb.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-4.5 align-top max-w-[240px]">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-blue-600 text-lg">{{ prb.vehicle?.code || '-' }}</span>
                  <span v-if="prb.vehicle?.name" class="font-bold text-blue-900 text-base bg-blue-100/90 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                    {{ prb.vehicle.name }}
                  </span>
                </div>
                <div class="text-base font-bold text-slate-800 mt-1 leading-snug break-words">{{ prb.vehicle?.brand }} {{ prb.vehicle?.model }}</div>
                <div v-if="prb.vehicle?.vin || prb.vehicle?.engineNo" class="text-xs text-slate-600 font-mono mt-1.5 space-y-0.5 leading-tight">
                  <div v-if="prb.vehicle?.vin" class="break-words" :title="'เลขตัวรถ: ' + prb.vehicle.vin">
                    <span class="text-slate-400 font-sans font-medium">คัสซี:</span> <span class="font-bold text-slate-800">{{ prb.vehicle.vin }}</span>
                  </div>
                  <div v-if="prb.vehicle?.engineNo" class="break-words" :title="'เลขเครื่องยนต์: ' + prb.vehicle.engineNo">
                    <span class="text-slate-400 font-sans font-medium">เครื่อง:</span> <span class="font-bold text-slate-800">{{ prb.vehicle.engineNo }}</span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap align-top">
                <div class="inline-block font-mono font-black text-lg bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs leading-tight">
                  {{ prb.vehicle?.plateNumber }}
                </div>
                <div class="text-sm font-bold text-slate-500 mt-1">
                  {{ prb.vehicle?.province }}
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap font-bold text-base text-slate-900 font-mono align-top">{{ prb.prbNumber || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-base font-medium text-slate-600 align-top">{{ prb.startDate || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap font-bold text-base text-slate-900 align-top">{{ prb.endDate || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-right font-black text-xl text-slate-900 align-top">฿{{ (prb.cost || 0).toLocaleString() }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-center align-top"><StatusBadge :days="prb.daysRemaining" /></td>
              <td v-if="isAdmin" class="px-5 py-4.5 whitespace-nowrap text-center align-top">
                <div class="inline-flex items-center gap-1.5 pt-0.5">
                  <button 
                    class="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200 text-xs font-semibold flex items-center gap-1 shadow-2xs" 
                    @click="handleRenew(prb, 'prb')" 
                    title="ต่ออายุ พ.ร.บ. ใหม่อีก 1 ปี (สร้างรายการใหม่)" 
                    type="button"
                  >
                    <Sparkles :size="13" class="text-amber-500" />
                    <span>ต่ออายุ</span>
                  </button>
                  <button class="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 hover:border-blue-300" @click="handleOpenEdit(prb)" title="แก้ไข" type="button">
                    <Edit2 :size="16" />
                  </button>
                  <button class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-300" @click="handleDelete(prb.id)" title="ลบ" type="button">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. Tax Table -->
      <div v-else-if="activeDocTab === 'tax'" class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 text-base font-bold text-slate-800 border-b border-slate-200">
            <tr>
              <th class="px-5 py-4 min-w-[200px]">รถ / รหัส</th>
              <th class="px-5 py-4 whitespace-nowrap">ทะเบียน / จังหวัด</th>
              <th class="px-5 py-4 whitespace-nowrap">วันที่ต่อทะเบียนล่าสุด</th>
              <th class="px-5 py-4 whitespace-nowrap">วันครบกำหนดต่อทะเบียน</th>
              <th class="px-5 py-4 text-right whitespace-nowrap">ค่าต่อทะเบียน (บาท)</th>
              <th class="px-5 py-4 text-center whitespace-nowrap">สถานะครบกำหนด</th>
              <th v-if="isAdmin" class="px-5 py-4 text-center whitespace-nowrap w-28">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredTax.length === 0">
              <td :colspan="isAdmin ? 7 : 6" class="text-center py-12 text-slate-400 text-base">ไม่พบข้อมูลต่อทะเบียนตามเงื่อนไข</td>
            </tr>
            <tr 
              v-else 
              v-for="tax in filteredTax" 
              :key="tax.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-4.5 align-top max-w-[240px]">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-blue-600 text-lg">{{ tax.vehicle?.code || '-' }}</span>
                  <span v-if="tax.vehicle?.name" class="font-bold text-blue-900 text-base bg-blue-100/90 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                    {{ tax.vehicle.name }}
                  </span>
                </div>
                <div class="text-base font-bold text-slate-800 mt-1 leading-snug break-words">{{ tax.vehicle?.brand }} {{ tax.vehicle?.model }}</div>
                <div v-if="tax.vehicle?.vin || tax.vehicle?.engineNo" class="text-xs text-slate-600 font-mono mt-1.5 space-y-0.5 leading-tight">
                  <div v-if="tax.vehicle?.vin" class="break-words" :title="'เลขตัวรถ: ' + tax.vehicle.vin">
                    <span class="text-slate-400 font-sans font-medium">คัสซี:</span> <span class="font-bold text-slate-800">{{ tax.vehicle.vin }}</span>
                  </div>
                  <div v-if="tax.vehicle?.engineNo" class="break-words" :title="'เลขเครื่องยนต์: ' + tax.vehicle.engineNo">
                    <span class="text-slate-400 font-sans font-medium">เครื่อง:</span> <span class="font-bold text-slate-800">{{ tax.vehicle.engineNo }}</span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap align-top">
                <div class="inline-block font-mono font-black text-lg bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs leading-tight">
                  {{ tax.plateNumber }}
                </div>
                <div class="text-sm font-bold text-slate-500 mt-1">
                  {{ tax.province }}
                </div>
              </td>
              <td class="px-5 py-4.5 whitespace-nowrap text-base font-medium text-slate-600 align-top">{{ tax.lastRenewalDate || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap font-bold text-base text-slate-900 align-top">{{ tax.expireDate || '-' }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-right font-black text-xl text-slate-900 align-top">฿{{ (tax.cost || 0).toLocaleString() }}</td>
              <td class="px-5 py-4.5 whitespace-nowrap text-center align-top"><StatusBadge :days="tax.daysRemaining" /></td>
              <td v-if="isAdmin" class="px-5 py-4.5 whitespace-nowrap text-center align-top">
                <div class="inline-flex items-center gap-1.5 pt-0.5">
                  <button 
                    class="px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white rounded-lg transition-colors border border-amber-200 text-xs font-semibold flex items-center gap-1 shadow-2xs" 
                    @click="handleRenew(tax, 'tax')" 
                    title="ต่ออายุภาษี/ทะเบียนใหม่อีก 1 ปี (สร้างรายการใหม่)" 
                    type="button"
                  >
                    <Sparkles :size="13" class="text-amber-600" />
                    <span>ต่ออายุ</span>
                  </button>
                  <button class="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 hover:border-blue-300" @click="handleOpenEdit(tax)" title="แก้ไข" type="button">
                    <Edit2 :size="16" />
                  </button>
                  <button class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-300" @click="handleDelete(tax.id)" title="ลบ" type="button">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <Modal
      :isOpen="isModalOpen"
      @close="handleCloseModal"
      :title="editingId ? 'แก้ไขข้อมูลเอกสาร' : isRenewMode ? `✨ ต่ออายุเอกสารใหม่ (+1 ปี) - ${activeDocTab === 'insurance' ? 'ประกันภัย' : activeDocTab === 'prb' ? 'พ.ร.บ.' : 'ต่อทะเบียน'}` : activeDocTab === 'insurance' ? 'บันทึกประกันภัยรถใหม่' : activeDocTab === 'prb' ? 'บันทึก พ.ร.บ. ใหม่' : 'บันทึกภาษีและต่อทะเบียนใหม่'"
    >
      <form @submit.prevent="handleSave" class="space-y-5">
        <!-- Renew Mode Notification Banner -->
        <div v-if="isRenewMode" class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
          <Sparkles :size="18" class="text-amber-600 shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <div class="font-bold text-amber-950">โหมดต่ออายุเอกสารใหม่ (1-Click Renewal)</div>
            <div class="text-amber-800 leading-relaxed">
              ระบบดึงข้อมูลรถเดิมและคำนวณวันเริ่ม-วันสิ้นสุดรอบใหม่ <strong>เพิ่มขึ้น +1 ปี</strong> ให้อัตโนมัติ โดยจะสร้างเป็นรายการใหม่และเก็บประวัติเดิมไว้
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. เลือกรถที่ต้องการบันทึก
          </h4>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">รถประจำร้าน <span class="text-rose-500">*</span></label>
            <select
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              v-model="formData.vehicleId"
              @change="handleVehicleChange"
              required
            >
              <option value="">-- กรุณาเลือกรถ --</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">
                {{ v.code }} - {{ v.name ? `[${v.name}] ` : '' }}ทะเบียน {{ v.plateNumber }} {{ v.province }} ({{ v.brand }} {{ v.model }})
              </option>
            </select>
          </div>

          <!-- Selected Vehicle Info Summary Box -->
          <div v-if="selectedVehicleInfo" class="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-sm space-y-2 shadow-2xs">
            <div class="font-bold text-blue-900 flex items-center justify-between text-base">
              <span>{{ selectedVehicleInfo.code }} - {{ selectedVehicleInfo.brand }} {{ selectedVehicleInfo.model }} ({{ selectedVehicleInfo.name }})</span>
              <span class="font-mono bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-black text-slate-900">{{ selectedVehicleInfo.plateNumber }} {{ selectedVehicleInfo.province }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-mono text-xs">
              <div class="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                <span class="text-slate-500 font-sans text-xs font-semibold block">🚗 เลขตัวรถ / เลขคัสซี (VIN):</span>
                <strong class="text-blue-950 font-bold select-all text-sm">{{ selectedVehicleInfo.vin || 'ยังไม่ระบุ' }}</strong>
              </div>
              <div class="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                <span class="text-slate-500 font-sans text-xs font-semibold block">⚙️ เลขเครื่องยนต์:</span>
                <strong class="text-slate-900 font-bold select-all text-sm">{{ selectedVehicleInfo.engineNo || 'ยังไม่ระบุ' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Specific Fields for Insurance -->
        <div v-if="activeDocTab === 'insurance'" class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียดประกันภัย
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">บริษัทประกันภัย <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.company"
                placeholder="เช่น วิริยะประกันภัย, กรุงเทพประกันภัย"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เลขที่กรมธรรม์</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.policyNumber"
                placeholder="เช่น 12345/POL-2025"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันเริ่มคุ้มครอง</label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.startDate"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันหมดอายุประกัน <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.endDate"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เบี้ยประกันภัย (บาท)</label>
              <input
                type="number"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.premiumAmount"
                placeholder="เช่น 18500"
              />
            </div>
          </div>
        </div>

        <!-- Specific Fields for PRB -->
        <div v-else-if="activeDocTab === 'prb'" class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียด พ.ร.บ.
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เลขที่ พ.ร.บ. <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.prbNumber"
                placeholder="เช่น PRB-2025-9988"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันเริ่มคุ้มครอง</label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.startDate"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันหมดอายุ พ.ร.บ. <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.endDate"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ค่า พ.ร.บ. (บาท)</label>
              <input
                type="number"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.cost"
                placeholder="เช่น 967"
              />
            </div>
          </div>
        </div>

        <!-- Specific Fields for Tax -->
        <div v-else-if="activeDocTab === 'tax'" class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียดต่อทะเบียนรถ
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ทะเบียนรถ</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.plateNumber"
                placeholder="เช่น 70-1234"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">จังหวัด</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.province"
                placeholder="เช่น นครปฐม"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันที่ต่อทะเบียนล่าสุด</label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.lastRenewalDate"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">วันครบกำหนดต่อทะเบียน <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.expireDate"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ค่าธรรมเนียมต่อทะเบียน (บาท)</label>
              <input
                type="number"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.cost"
                placeholder="เช่น 2400"
              />
            </div>
          </div>
        </div>

        <!-- Common Note -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            3. หมายเหตุเพิ่มเติม
          </h4>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">หมายเหตุ</label>
            <textarea
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              rows="2"
              v-model="formData.notes"
              placeholder="ระบุข้อความเพิ่มเติม..."
            />
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <AppButton variant="secondary" @click="isModalOpen = false">
            ยกเลิก
          </AppButton>
          <AppButton type="submit" variant="primary" :loading="saving">
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลเอกสาร' }}
          </AppButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { 
  ShieldCheck, 
  FileText, 
  FileCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Calendar, 
  DollarSign, 
  Building2, 
  CheckCircle,
  FileSpreadsheet,
  Sparkles
} from 'lucide-vue-next';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import Modal from '../components/Modal.vue';
import AppButton from '../components/AppButton.vue';
import { useAuth } from '../composables/useAuth';
import { useStaff } from '../composables/useStaff';

const props = defineProps({
  renewPayload: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['clearRenewPayload', 'documentSaved']);

const { isAdmin } = useAuth();
const { getStaffFormattedList, defaultStaffLabel, loadStaff } = useStaff();

const customCreatedByMode = ref(false);
const isRenewMode = ref(false);
const activeDocTab = ref('insurance'); // insurance, prb, tax
const vehicles = ref([]);
const insuranceList = ref([]);
const prbList = ref([]);
const taxList = ref([]);
const loading = ref(true);

const searchTerm = ref('');
const vehicleFilter = ref('all');
const statusFilter = ref('all');

const isModalOpen = ref(false);
const editingId = ref(null);
const saving = ref(false);

const formData = ref({
  vehicleId: '',
  company: '',
  policyNumber: '',
  premiumAmount: '',
  prbNumber: '',
  cost: '',
  plateNumber: '',
  province: '',
  lastRenewalDate: '',
  expireDate: '',
  startDate: '',
  endDate: '',
  notes: '',
  createdBy: defaultStaffLabel.value
});

// Helper to calculate date +1 year
const addOneYear = (dateStr) => {
  if (!dateStr) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10) + 1;
    return `${year}-${parts[1]}-${parts[2]}`;
  }
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

const loadData = async () => {
  try {
    loading.value = true;
    const [vRes, insRes, prbRes, taxRes] = await Promise.all([
      api.getVehicles(),
      api.getInsurance(),
      api.getPrb(),
      api.getTax()
    ]);
    if (vRes.success) vehicles.value = vRes.data;
    if (insRes.success) insuranceList.value = insRes.data;
    if (prbRes.success) prbList.value = prbRes.data;
    if (taxRes.success) taxList.value = taxRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleVehicleChange = () => {
  const selected = vehicles.value.find(v => v.id === formData.value.vehicleId);
  if (selected) {
    formData.value.plateNumber = selected.plateNumber;
    formData.value.province = selected.province;
  }
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  isRenewMode.value = false;
  editingId.value = null;
  emit('clearRenewPayload');
};

const handleOpenAdd = () => {
  const defaultVeh = vehicles.value[0]?.id || '';
  const todayStr = new Date().toISOString().split('T')[0];
  const nextYearStr = addOneYear(todayStr);

  isRenewMode.value = false;
  editingId.value = null;
  customCreatedByMode.value = false;
  formData.value = {
    vehicleId: defaultVeh,
    company: 'วิริยะประกันภัย',
    policyNumber: '',
    premiumAmount: '',
    prbNumber: '',
    cost: '',
    plateNumber: vehicles.value[0]?.plateNumber || '',
    province: vehicles.value[0]?.province || 'นครปฐม',
    lastRenewalDate: todayStr,
    expireDate: nextYearStr,
    startDate: todayStr,
    endDate: nextYearStr,
    notes: '',
    createdBy: defaultStaffLabel.value
  };
  isModalOpen.value = true;
};

const handleOpenEdit = (item) => {
  isRenewMode.value = false;
  editingId.value = item.id;
  const isCustom = !getStaffFormattedList.value.some(s => s.label === item.createdBy);
  customCreatedByMode.value = isCustom;
  formData.value = {
    vehicleId: item.vehicleId || '',
    company: item.company || '',
    policyNumber: item.policyNumber || '',
    premiumAmount: item.premiumAmount || '',
    prbNumber: item.prbNumber || '',
    cost: item.cost || '',
    plateNumber: item.plateNumber || '',
    province: item.province || '',
    lastRenewalDate: item.lastRenewalDate || '',
    expireDate: item.expireDate || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    notes: item.notes || '',
    createdBy: item.createdBy || defaultStaffLabel.value
  };
  isModalOpen.value = true;
};

const handleRenew = (item, type = 'insurance') => {
  if (type) activeDocTab.value = type;
  isRenewMode.value = true;
  editingId.value = null; // Create a NEW record
  customCreatedByMode.value = false;

  const todayStr = new Date().toISOString().split('T')[0];
  const veh = item.vehicle || vehicles.value.find(v => v.id === item.vehicleId);

  if (type === 'insurance') {
    const newStart = item.endDate || todayStr;
    const newEnd = addOneYear(newStart);
    formData.value = {
      vehicleId: item.vehicleId || '',
      company: item.company || 'วิริยะประกันภัย',
      policyNumber: '',
      premiumAmount: item.premiumAmount || '',
      prbNumber: '',
      cost: '',
      plateNumber: veh?.plateNumber || item.plateNumber || '',
      province: veh?.province || item.province || 'นครปฐม',
      lastRenewalDate: '',
      expireDate: '',
      startDate: newStart,
      endDate: newEnd,
      notes: `ต่ออายุจากกรมธรรม์เดิม (${item.policyNumber || 'รอบก่อนหน้า'})`,
      createdBy: defaultStaffLabel.value
    };
  } else if (type === 'prb') {
    const newStart = item.endDate || todayStr;
    const newEnd = addOneYear(newStart);
    formData.value = {
      vehicleId: item.vehicleId || '',
      company: '',
      policyNumber: '',
      premiumAmount: '',
      prbNumber: '',
      cost: item.cost || '',
      plateNumber: veh?.plateNumber || item.plateNumber || '',
      province: veh?.province || item.province || 'นครปฐม',
      lastRenewalDate: '',
      expireDate: '',
      startDate: newStart,
      endDate: newEnd,
      notes: `ต่ออายุจาก พ.ร.บ. เดิม (${item.prbNumber || 'รอบก่อนหน้า'})`,
      createdBy: defaultStaffLabel.value
    };
  } else if (type === 'tax') {
    const newLastRenewal = item.expireDate || todayStr;
    const newExpire = addOneYear(newLastRenewal);
    formData.value = {
      vehicleId: item.vehicleId || '',
      company: '',
      policyNumber: '',
      premiumAmount: '',
      prbNumber: '',
      cost: item.cost || '',
      plateNumber: veh?.plateNumber || item.plateNumber || '',
      province: veh?.province || item.province || 'นครปฐม',
      lastRenewalDate: newLastRenewal,
      expireDate: newExpire,
      startDate: '',
      endDate: '',
      notes: `ต่อภาษีและตรวจสภาพประจำปี (${newExpire.split('-')[0]})`,
      createdBy: defaultStaffLabel.value
    };
  }

  isModalOpen.value = true;
};

const handleSave = async () => {
  if (!formData.value.vehicleId) {
    alert('กรุณาเลือกรถ');
    return;
  }

  try {
    saving.value = true;
    if (activeDocTab.value === 'insurance') {
      if (!formData.value.endDate) return alert('กรุณาระบุวันหมดประกัน');
      if (editingId.value) {
        await api.updateInsurance(editingId.value, formData.value);
      } else {
        await api.createInsurance(formData.value);
      }
    } else if (activeDocTab.value === 'prb') {
      if (!formData.value.endDate) return alert('กรุณาระบุวันหมดอายุ พ.ร.บ.');
      if (editingId.value) {
        await api.updatePrb(editingId.value, formData.value);
      } else {
        await api.createPrb(formData.value);
      }
    } else if (activeDocTab.value === 'tax') {
      if (!formData.value.expireDate) return alert('กรุณาระบุวันครบกำหนดต่อทะเบียน');
      if (editingId.value) {
        await api.updateTax(editingId.value, formData.value);
      } else {
        await api.createTax(formData.value);
      }
    }
    isModalOpen.value = false;
    isRenewMode.value = false;
    editingId.value = null;
    emit('clearRenewPayload');
    emit('documentSaved');
    await loadData();
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (id) => {
  if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการเอกสารนี้?')) return;
  try {
    if (activeDocTab.value === 'insurance') await api.deleteInsurance(id);
    if (activeDocTab.value === 'prb') await api.deletePrb(id);
    if (activeDocTab.value === 'tax') await api.deleteTax(id);
    emit('documentSaved');
    await loadData();
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการลบ: ' + err.message);
  }
};

const selectedVehicleInfo = computed(() => {
  if (!formData.value.vehicleId) return null;
  return vehicles.value.find(v => v.id === formData.value.vehicleId) || null;
});

const filterList = (list) => {
  return [...list].filter(item => {
    const veh = item.vehicle;
    const plate = veh ? `${veh.plateNumber} ${veh.province}` : '';
    const brandModel = veh ? `${veh.brand} ${veh.model}` : '';
    const name = veh?.name || '';
    const vin = veh?.vin || '';
    const engineNo = veh?.engineNo || '';
    const docNo = item.policyNumber || item.prbNumber || item.company || '';

    const q = searchTerm.value.toLowerCase();
    const matchSearch = 
      plate.toLowerCase().includes(q) ||
      brandModel.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      vin.toLowerCase().includes(q) ||
      engineNo.toLowerCase().includes(q) ||
      docNo.toLowerCase().includes(q);

    const matchVeh = vehicleFilter.value === 'all' || item.vehicleId === vehicleFilter.value;

    const days = item.daysRemaining;
    let matchStatus = true;
    if (statusFilter.value === 'expired') matchStatus = days !== null && days < 0;
    else if (statusFilter.value === 'urgent') matchStatus = days !== null && days >= 0 && days <= 7;
    else if (statusFilter.value === 'warning') matchStatus = days !== null && days > 7 && days <= 60;
    else if (statusFilter.value === 'normal') matchStatus = days !== null && days > 60;

    return matchSearch && matchVeh && matchStatus;
  }).sort((a, b) => {
    const codeA = a.vehicle?.code || '';
    const codeB = b.vehicle?.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });
};

const filteredInsurance = computed(() => filterList(insuranceList.value));
const filteredPrb = computed(() => filterList(prbList.value));
const filteredTax = computed(() => filterList(taxList.value));

// Process renewal payload when arriving from Dashboard or other views
watch(() => props.renewPayload, (newPayload) => {
  if (newPayload && newPayload.type && newPayload.type !== 'oil') {
    const doc = newPayload.rawDoc || newPayload;
    handleRenew(doc, newPayload.type);
  }
}, { immediate: true });

onMounted(() => {
  loadData();
  loadStaff();
});
</script>
