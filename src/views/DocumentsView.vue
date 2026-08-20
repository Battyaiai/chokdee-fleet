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
        <span>ภาษี / ต่อทะเบียน ({{ taxList.length }})</span>
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
        <table class="w-full text-left text-sm border-collapse min-w-[900px]">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">รถ / รหัส</th>
              <th class="px-5 py-3">ทะเบียน</th>
              <th class="px-5 py-3">บริษัทประกัน</th>
              <th class="px-5 py-3">เลขกรมธรรม์</th>
              <th class="px-5 py-3">วันที่เริ่ม</th>
              <th class="px-5 py-3">วันหมดประกัน</th>
              <th class="px-5 py-3 text-right">ค่าเบี้ย (บาท)</th>
              <th class="px-5 py-3 text-center">สถานะวันหมดอายุ</th>
              <th class="px-5 py-3">ผู้บันทึก</th>
              <th v-if="isAdmin" class="px-5 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredInsurance.length === 0">
              <td colspan="10" class="text-center py-10 text-slate-400">ไม่พบข้อมูลประกันภัยตามเงื่อนไข</td>
            </tr>
            <tr 
              v-else 
              v-for="ins in filteredInsurance" 
              :key="ins.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="font-bold text-blue-600">{{ ins.vehicle?.code || '-' }}</div>
                <div class="text-xs text-slate-400">{{ ins.vehicle?.brand }} {{ ins.vehicle?.model }}</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                  {{ ins.vehicle?.plateNumber }} {{ ins.vehicle?.province }}
                </span>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-900">{{ ins.company || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-slate-600">{{ ins.policyNumber || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-slate-500">{{ ins.startDate || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">{{ ins.endDate || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-900">฿{{ (ins.premiumAmount || 0).toLocaleString() }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-center"><StatusBadge :days="ins.daysRemaining" /></td>
              <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">{{ ins.createdBy || '-' }}</td>
              <td v-if="isAdmin" class="px-5 py-3.5 whitespace-nowrap text-center">
                <div class="inline-flex items-center gap-1.5">
                  <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" @click="handleOpenEdit(ins)" title="แก้ไข" type="button">
                    <Edit2 :size="15" />
                  </button>
                  <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors" @click="handleDelete(ins.id)" title="ลบ" type="button">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. PRB Table -->
      <div v-else-if="activeDocTab === 'prb'" class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse min-w-[900px]">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">รถ / รหัส</th>
              <th class="px-5 py-3">ทะเบียน</th>
              <th class="px-5 py-3">เลข พ.ร.บ.</th>
              <th class="px-5 py-3">วันที่เริ่ม</th>
              <th class="px-5 py-3">วันหมดอายุ</th>
              <th class="px-5 py-3 text-right">ค่า พ.ร.บ. (บาท)</th>
              <th class="px-5 py-3 text-center">สถานะวันหมดอายุ</th>
              <th class="px-5 py-3">ผู้บันทึก</th>
              <th v-if="isAdmin" class="px-5 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredPrb.length === 0">
              <td colspan="9" class="text-center py-10 text-slate-400">ไม่พบข้อมูล พ.ร.บ. ตามเงื่อนไข</td>
            </tr>
            <tr 
              v-else 
              v-for="prb in filteredPrb" 
              :key="prb.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="font-bold text-blue-600">{{ prb.vehicle?.code || '-' }}</div>
                <div class="text-xs text-slate-400">{{ prb.vehicle?.brand }} {{ prb.vehicle?.model }}</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                  {{ prb.vehicle?.plateNumber }} {{ prb.vehicle?.province }}
                </span>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-900">{{ prb.prbNumber || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-slate-500">{{ prb.startDate || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">{{ prb.endDate || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-900">฿{{ (prb.cost || 0).toLocaleString() }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-center"><StatusBadge :days="prb.daysRemaining" /></td>
              <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">{{ prb.createdBy || '-' }}</td>
              <td v-if="isAdmin" class="px-5 py-3.5 whitespace-nowrap text-center">
                <div class="inline-flex items-center gap-1.5">
                  <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" @click="handleOpenEdit(prb)" title="แก้ไข" type="button">
                    <Edit2 :size="15" />
                  </button>
                  <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors" @click="handleDelete(prb.id)" title="ลบ" type="button">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. Tax Table -->
      <div v-else-if="activeDocTab === 'tax'" class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse min-w-[900px]">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">รถ / รหัส</th>
              <th class="px-5 py-3">ทะเบียน / จังหวัด</th>
              <th class="px-5 py-3">วันที่ต่อภาษีล่าสุด</th>
              <th class="px-5 py-3">วันครบกำหนดต่อทะเบียน</th>
              <th class="px-5 py-3 text-right">ค่าต่อทะเบียน (บาท)</th>
              <th class="px-5 py-3 text-center">สถานะครบกำหนด</th>
              <th class="px-5 py-3">ผู้บันทึก</th>
              <th v-if="isAdmin" class="px-5 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="filteredTax.length === 0">
              <td colspan="8" class="text-center py-10 text-slate-400">ไม่พบข้อมูลต่อทะเบียนตามเงื่อนไข</td>
            </tr>
            <tr 
              v-else 
              v-for="tax in filteredTax" 
              :key="tax.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="font-bold text-blue-600">{{ tax.vehicle?.code || '-' }}</div>
                <div class="text-xs text-slate-400">{{ tax.vehicle?.brand }} {{ tax.vehicle?.model }}</div>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                  {{ tax.plateNumber }} {{ tax.province }}
                </span>
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap text-slate-500">{{ tax.lastRenewalDate || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">{{ tax.expireDate || '-' }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-900">฿{{ (tax.cost || 0).toLocaleString() }}</td>
              <td class="px-5 py-3.5 whitespace-nowrap text-center"><StatusBadge :days="tax.daysRemaining" /></td>
              <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">{{ tax.createdBy || '-' }}</td>
              <td v-if="isAdmin" class="px-5 py-3.5 whitespace-nowrap text-center">
                <div class="inline-flex items-center gap-1.5">
                  <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" @click="handleOpenEdit(tax)" title="แก้ไข" type="button">
                    <Edit2 :size="15" />
                  </button>
                  <button class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors" @click="handleDelete(tax.id)" title="ลบ" type="button">
                    <Trash2 :size="15" />
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
      @close="isModalOpen = false"
      :title="editingId ? 'แก้ไขข้อมูลเอกสาร' : activeDocTab === 'insurance' ? 'บันทึกประกันภัยรถใหม่' : activeDocTab === 'prb' ? 'บันทึก พ.ร.บ. ใหม่' : 'บันทึกภาษีและต่อทะเบียนใหม่'"
    >
      <form @submit.prevent="handleSave" class="space-y-5">
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. เลือกรถที่ต้องการบันทึก
          </h4>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">รถประจำร้าน <span class="text-rose-500">*</span></label>
            <select
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              v-model="formData.vehicleId"
              @change="handleVehicleChange"
              required
            >
              <option value="">-- กรุณาเลือกรถ --</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">
                {{ v.code }} - ทะเบียน {{ v.plateNumber }} {{ v.province }} ({{ v.brand }} {{ v.model }})
              </option>
            </select>
          </div>
        </div>

        <!-- Specific Fields for Insurance -->
        <div v-if="activeDocTab === 'insurance'" class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียดประกันภัย
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">บริษัทประกันภัย <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.company"
                placeholder="เช่น วิริยะประกันภัย, กรุงเทพประกันภัย"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขที่กรมธรรม์</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.policyNumber"
                placeholder="เช่น 12345/POL-2025"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันเริ่มคุ้มครอง</label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.startDate"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันหมดอายุประกัน <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.endDate"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">เบี้ยประกันภัย (บาท)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.premiumAmount"
                placeholder="เช่น 18500"
              />
            </div>
          </div>
        </div>

        <!-- Specific Fields for PRB -->
        <div v-else-if="activeDocTab === 'prb'" class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียด พ.ร.บ.
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขที่ พ.ร.บ. <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.prbNumber"
                placeholder="เช่น PRB-2025-9988"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันเริ่มคุ้มครอง</label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.startDate"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันหมดอายุ พ.ร.บ. <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.endDate"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">ค่า พ.ร.บ. (บาท)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.cost"
                placeholder="เช่น 967"
              />
            </div>
          </div>
        </div>

        <!-- Specific Fields for Tax -->
        <div v-else-if="activeDocTab === 'tax'" class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. รายละเอียดภาษี / ต่อทะเบียน
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ทะเบียนรถ</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.plateNumber"
                placeholder="เช่น 70-1234"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">จังหวัด</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.province"
                placeholder="เช่น นครปฐม"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันที่ต่อภาษีล่าสุด</label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.lastRenewalDate"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">วันครบกำหนดต่อทะเบียน <span class="text-rose-500">*</span></label>
              <input
                type="date"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.expireDate"
                required
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">ค่าธรรมเนียมต่อทะเบียน/ภาษี (บาท)</label>
              <input
                type="number"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.cost"
                placeholder="เช่น 2400"
              />
            </div>
          </div>
        </div>

        <!-- Common Note & CreatedBy -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            3. หมายเหตุและผู้บันทึก
          </h4>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุ</label>
              <textarea
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                rows="2"
                v-model="formData.notes"
                placeholder="ระบุข้อความเพิ่มเติม..."
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-700">ผู้บันทึกข้อมูล <span class="text-rose-500">*</span></label>
                <button 
                  type="button" 
                  class="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
                  @click="customCreatedByMode = !customCreatedByMode"
                >
                  {{ customCreatedByMode ? '← เลือกจากรายชื่อ' : '+ พิมพ์ระบุเอง' }}
                </button>
              </div>

              <select
                v-if="!customCreatedByMode"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.createdBy"
                required
              >
                <option v-for="staff in getStaffFormattedList" :key="staff.id" :value="staff.label">
                  {{ staff.label }}{{ staff.isDefault ? ' (ค่าเริ่มต้น)' : '' }}
                </option>
              </select>

              <input
                v-else
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.createdBy"
                placeholder="ระบุชื่อและตำแหน่งผู้บันทึก..."
                required
              />
            </div>
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
import { ref, computed, onMounted } from 'vue';
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
  FileSpreadsheet
} from 'lucide-vue-next';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge.vue';
import Modal from '../components/Modal.vue';
import AppButton from '../components/AppButton.vue';
import { useAuth } from '../composables/useAuth';
import { useStaff } from '../composables/useStaff';

const { isAdmin } = useAuth();
const { getStaffFormattedList, defaultStaffLabel, loadStaff } = useStaff();

const customCreatedByMode = ref(false);
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

onMounted(() => {
  loadData();
  loadStaff();
});

const handleVehicleChange = () => {
  const selected = vehicles.value.find(v => v.id === formData.value.vehicleId);
  if (selected) {
    formData.value.plateNumber = selected.plateNumber;
    formData.value.province = selected.province;
  }
};

const handleOpenAdd = () => {
  const defaultVeh = vehicles.value[0]?.id || '';
  const todayStr = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const nextYearStr = nextYear.toISOString().split('T')[0];

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
    await loadData();
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการลบ: ' + err.message);
  }
};

const filterList = (list) => {
  return list.filter(item => {
    const veh = item.vehicle;
    const plate = veh ? `${veh.plateNumber} ${veh.province}` : '';
    const brandModel = veh ? `${veh.brand} ${veh.model}` : '';
    const docNo = item.policyNumber || item.prbNumber || item.company || '';

    const q = searchTerm.value.toLowerCase();
    const matchSearch = 
      plate.toLowerCase().includes(q) ||
      brandModel.toLowerCase().includes(q) ||
      docNo.toLowerCase().includes(q);

    const matchVeh = vehicleFilter.value === 'all' || item.vehicleId === vehicleFilter.value;

    const days = item.daysRemaining;
    let matchStatus = true;
    if (statusFilter.value === 'expired') matchStatus = days !== null && days < 0;
    else if (statusFilter.value === 'urgent') matchStatus = days !== null && days >= 0 && days <= 7;
    else if (statusFilter.value === 'warning') matchStatus = days !== null && days > 7 && days <= 60;
    else if (statusFilter.value === 'normal') matchStatus = days !== null && days > 60;

    return matchSearch && matchVeh && matchStatus;
  });
};

const filteredInsurance = computed(() => filterList(insuranceList.value));
const filteredPrb = computed(() => filterList(prbList.value));
const filteredTax = computed(() => filterList(taxList.value));
</script>
