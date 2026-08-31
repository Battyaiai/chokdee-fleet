<template>
  <div class="space-y-6">
    <!-- -------------------------------------------------------------
         SINGLE VEHICLE DETAIL VIEW
         ------------------------------------------------------------- -->
    <div v-if="selectedVehicleId && detailVehicle" class="space-y-6">
      <!-- Back Button -->
      <div>
        <AppButton variant="secondary" size="sm" @click="emit('clearSelectedVehicle')">
          <ArrowLeft :size="15" />
          <span>กลับไปหน้ารายการรถ</span>
        </AppButton>
      </div>

      <!-- Vehicle Header Card -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-block px-3 py-1 font-mono font-bold text-sm bg-slate-100 text-slate-800 border border-slate-300 rounded-lg">
              {{ detailVehicle.plateNumber }} {{ detailVehicle.province }}
            </span>
            <StatusBadge :status="detailVehicle.status" type="vehicleStatus" />
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {{ detailVehicle.code }}
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {{ detailVehicle.brand }} {{ detailVehicle.model }} ({{ detailVehicle.name }})
          </h2>
          <p class="text-xs sm:text-sm text-slate-500">
            ประเภท: {{ detailVehicle.type }} | สี: {{ detailVehicle.color || '-' }} | ปี: {{ detailVehicle.year || '-' }}
          </p>
        </div>

        <div v-if="isAdmin">
          <AppButton variant="secondary" size="sm" @click="handleOpenEdit(detailVehicle)">
            <Edit2 :size="14" />
            <span>แก้ไขข้อมูลรถ</span>
          </AppButton>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex border-b border-slate-200 gap-1 overflow-x-auto no-scrollbar">
        <button 
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
            activeTab === 'info' 
              ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          ]"
          @click="activeTab = 'info'"
          type="button"
        >
          <Info :size="16" />
          <span>ข้อมูลรถ</span>
        </button>
        <button 
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
            activeTab === 'docs' 
              ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          ]"
          @click="activeTab = 'docs'"
          type="button"
        >
          <FileCheck :size="16" />
          <span>เอกสารและวันครบกำหนด</span>
        </button>
        <button 
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
            activeTab === 'oil' 
              ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          ]"
          @click="activeTab = 'oil'"
          type="button"
        >
          <Droplet :size="16" />
          <span>ประวัติน้ำมันเครื่อง</span>
        </button>
        <button 
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
            activeTab === 'maintenance' 
              ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          ]"
          @click="activeTab = 'maintenance'"
          type="button"
        >
          <Wrench :size="16" />
          <span>ประวัติซ่อมบำรุง</span>
        </button>
        <button 
          :class="[
            'px-4 py-2.5 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap',
            activeTab === 'expenses' 
              ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' 
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          ]"
          @click="activeTab = 'expenses'"
          type="button"
        >
          <DollarSign :size="16" />
          <span>สรุปค่าใช้จ่าย</span>
        </button>
      </div>

      <!-- Tab 1: Vehicle Info -->
      <div v-if="activeTab === 'info'" class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 class="text-base font-bold text-blue-900">
          ข้อมูลจำเพาะของรถ
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
          <div>
            <span class="text-xs font-medium text-slate-400 block">รหัสรถในร้าน:</span>
            <p class="font-bold text-slate-800 text-base mt-0.5">{{ detailVehicle.code || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ชื่อเรียก / ภารกิจ:</span>
            <p class="font-bold text-slate-800 text-base mt-0.5">{{ detailVehicle.name || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ยี่ห้อ - รุ่น:</span>
            <p class="font-bold text-slate-800 text-base mt-0.5">{{ detailVehicle.brand }} {{ detailVehicle.model }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ทะเบียนรถ / จังหวัด:</span>
            <p class="font-bold text-slate-800 text-base mt-0.5">{{ detailVehicle.plateNumber }} ({{ detailVehicle.province }})</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ประเภทรถ:</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ detailVehicle.type || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">สถานะการใช้งาน:</span>
            <div class="mt-0.5">
              <StatusBadge :status="detailVehicle.status" type="vehicleStatus" />
            </div>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">สีรถ:</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ detailVehicle.color || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ปีจดทะเบียน:</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ detailVehicle.year || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">เลขตัวรถ / คัสซี (VIN):</span>
            <p class="font-mono font-bold text-blue-900 mt-0.5 select-all">{{ detailVehicle.vin || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">เลขเครื่องยนต์:</span>
            <p class="font-mono font-bold text-slate-900 mt-0.5 select-all">{{ detailVehicle.engineNo || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">วันที่เพิ่มข้อมูล:</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ detailVehicle.createdAt ? new Date(detailVehicle.createdAt).toLocaleDateString('th-TH') : '-' }}</p>
          </div>
          <div class="sm:col-span-2 lg:col-span-3">
            <span class="text-xs font-medium text-slate-400 block">หมายเหตุเพิ่มเติม:</span>
            <p class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm mt-1">
              {{ detailVehicle.notes || 'ไม่มีหมายเหตุ' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tab 2: Documents -->
      <div v-else-if="activeTab === 'docs'" class="space-y-6">
        <!-- Insurance -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <ShieldCheck :size="18" class="text-blue-600" />
            <h4 class="font-bold text-sm text-slate-900">ประกันภัยรถ</h4>
          </div>
          <div v-if="(detailVehicle.insuranceDocs || []).length === 0" class="p-6 text-center text-sm text-slate-400">
            ยังไม่มีข้อมูลประกันภัย
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-base font-bold text-slate-800 border-b border-slate-200">
                <tr>
                  <th class="px-5 py-3">บริษัทประกัน</th>
                  <th class="px-5 py-3">เลขกรมธรรม์</th>
                  <th class="px-5 py-3">วันเริ่ม</th>
                  <th class="px-5 py-3">วันหมดประกัน</th>
                  <th class="px-5 py-3">เบี้ยประกัน</th>
                  <th class="px-5 py-3">สถานะวันหมดอายุ</th>
                  <th v-if="isAdmin" class="px-5 py-3 text-center w-28">จัดการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr v-for="ins in detailVehicle.insuranceDocs" :key="ins.id" class="hover:bg-slate-50/70">
                  <td class="px-5 py-3 font-semibold text-slate-900">{{ ins.company || '-' }}</td>
                  <td class="px-5 py-3">{{ ins.policyNumber || '-' }}</td>
                  <td class="px-5 py-3">{{ ins.startDate || '-' }}</td>
                  <td class="px-5 py-3 font-bold">{{ ins.endDate || '-' }}</td>
                  <td class="px-5 py-3 font-medium">฿{{ (ins.premiumAmount || 0).toLocaleString() }}</td>
                  <td class="px-5 py-3">
                    <StatusBadge :days="calcDaysRemaining(ins.endDate)" />
                  </td>
                  <td v-if="isAdmin" class="px-5 py-3 text-center">
                    <button 
                      class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-200 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                      @click="handleQuickRenew(ins, 'insurance')"
                      type="button"
                    >
                      <Sparkles :size="12" class="text-amber-500" />
                      <span>ต่ออายุ</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PRB -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <FileText :size="18" class="text-rose-600" />
            <h4 class="font-bold text-sm text-slate-900">พ.ร.บ.</h4>
          </div>
          <div v-if="(detailVehicle.prbDocs || []).length === 0" class="p-6 text-center text-sm text-slate-400">
            ยังไม่มีข้อมูล พ.ร.บ.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="px-5 py-3">เลข พ.ร.บ.</th>
                  <th class="px-5 py-3">วันเริ่ม</th>
                  <th class="px-5 py-3">วันหมดอายุ</th>
                  <th class="px-5 py-3">ค่าใช้จ่าย</th>
                  <th class="px-5 py-3">สถานะวันหมดอายุ</th>
                  <th v-if="isAdmin" class="px-5 py-3 text-center w-28">จัดการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr v-for="prb in detailVehicle.prbDocs" :key="prb.id" class="hover:bg-slate-50/70">
                  <td class="px-5 py-3 font-semibold text-slate-900">{{ prb.prbNumber || '-' }}</td>
                  <td class="px-5 py-3">{{ prb.startDate || '-' }}</td>
                  <td class="px-5 py-3 font-bold">{{ prb.endDate || '-' }}</td>
                  <td class="px-5 py-3 font-medium">฿{{ (prb.cost || 0).toLocaleString() }}</td>
                  <td class="px-5 py-3">
                    <StatusBadge :days="calcDaysRemaining(prb.endDate)" />
                  </td>
                  <td v-if="isAdmin" class="px-5 py-3 text-center">
                    <button 
                      class="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                      @click="handleQuickRenew(prb, 'prb')"
                      type="button"
                    >
                      <Sparkles :size="12" class="text-amber-500" />
                      <span>ต่ออายุ</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tax -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <FileCheck :size="18" class="text-amber-700" />
            <h4 class="font-bold text-sm text-slate-900">ภาษีและต่อทะเบียน</h4>
          </div>
          <div v-if="(detailVehicle.taxDocs || []).length === 0" class="p-6 text-center text-sm text-slate-400">
            ยังไม่มีข้อมูลต่อทะเบียน
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="px-5 py-3">ทะเบียน / จังหวัด</th>
                  <th class="px-5 py-3">วันที่ต่อล่าสุด</th>
                  <th class="px-5 py-3">วันครบกำหนด</th>
                  <th class="px-5 py-3">ค่าต่อทะเบียน</th>
                  <th class="px-5 py-3">สถานะครบกำหนด</th>
                  <th v-if="isAdmin" class="px-5 py-3 text-center w-28">จัดการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr v-for="tax in detailVehicle.taxDocs" :key="tax.id" class="hover:bg-slate-50/70">
                  <td class="px-5 py-3 font-semibold text-slate-900">{{ tax.plateNumber }} {{ tax.province }}</td>
                  <td class="px-5 py-3">{{ tax.lastRenewalDate || '-' }}</td>
                  <td class="px-5 py-3 font-bold">{{ tax.expireDate || '-' }}</td>
                  <td class="px-5 py-3 font-medium">฿{{ (tax.cost || 0).toLocaleString() }}</td>
                  <td class="px-5 py-3">
                    <StatusBadge :days="calcDaysRemaining(tax.expireDate)" />
                  </td>
                  <td v-if="isAdmin" class="px-5 py-3 text-center">
                    <button 
                      class="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white rounded-lg transition-colors border border-amber-200 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                      @click="handleQuickRenew(tax, 'tax')"
                      type="button"
                    >
                      <Sparkles :size="12" class="text-amber-600" />
                      <span>ต่ออายุ</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 3: Oil Changes -->
      <div v-else-if="activeTab === 'oil'" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Droplet :size="18" class="text-blue-600" />
            <h4 class="font-bold text-sm text-slate-900">ประวัติเปลี่ยนถ่ายน้ำมันเครื่อง ({{ detailVehicle.plateNumber }})</h4>
          </div>
          <button 
            v-if="isAdmin"
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-2xs"
            @click="handleQuickRenew({ vehicleId: detailVehicle.id }, 'oil')"
            type="button"
          >
            <Plus :size="14" />
            <span>บันทึกเปลี่ยนถ่ายน้ำมันเครื่อง</span>
          </button>
        </div>
        <div v-if="(detailVehicle.oilChanges || []).length === 0" class="p-8 text-center text-sm text-slate-400">
          ยังไม่มีประวัติเปลี่ยนถ่ายน้ำมันเครื่อง
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th class="px-5 py-3">วันที่</th>
                <th class="px-5 py-3">เลขไมล์ ณ วันที่เปลี่ยน</th>
                <th class="px-5 py-3">รายการน้ำมัน / รายละเอียด</th>
                <th class="px-5 py-3 text-right">ค่าใช้จ่าย</th>
                <th class="px-5 py-3">นัดครั้งต่อไป</th>
                <th class="px-5 py-3">เลขไมล์เป้าหมาย</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="oil in detailVehicle.oilChanges" :key="oil.id" class="hover:bg-slate-50/70">
                <td class="px-5 py-3 font-medium">{{ oil.changeDate || '-' }}</td>
                <td class="px-5 py-3 font-bold text-slate-900">{{ (oil.currentMileage || 0).toLocaleString() }} กม.</td>
                <td class="px-5 py-3">{{ oil.oilDetails || '-' }}</td>
                <td class="px-5 py-3 text-right font-bold text-slate-900">฿{{ (oil.cost || 0).toLocaleString() }}</td>
                <td class="px-5 py-3">{{ oil.nextChangeDate || '-' }}</td>
                <td class="px-5 py-3">{{ oil.nextMileage ? `${oil.nextMileage.toLocaleString()} กม.` : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 4: Maintenance -->
      <div v-else-if="activeTab === 'maintenance'" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Wrench :size="18" class="text-rose-600" />
          <h4 class="font-bold text-sm text-slate-900">ประวัติซ่อมบำรุง ({{ detailVehicle.plateNumber }})</h4>
        </div>
        <div v-if="(detailVehicle.maintenances || []).length === 0" class="p-8 text-center text-sm text-slate-400">
          ยังไม่มีประวัติการซ่อมบำรุง
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th class="px-5 py-3">วันที่</th>
                <th class="px-5 py-3">เลขไมล์</th>
                <th class="px-5 py-3">รายละเอียดการซ่อม</th>
                <th class="px-5 py-3">อู่ / ร้านซ่อม</th>
                <th class="px-5 py-3 text-right">ค่าใช้จ่าย</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="mnt in detailVehicle.maintenances" :key="mnt.id" class="hover:bg-slate-50/70">
                <td class="px-5 py-3 font-medium">{{ mnt.repairDate || '-' }}</td>
                <td class="px-5 py-3">{{ (mnt.mileage || 0).toLocaleString() }} กม.</td>
                <td class="px-5 py-3 font-semibold text-slate-900">{{ mnt.description }}</td>
                <td class="px-5 py-3">{{ mnt.garage || '-' }}</td>
                <td class="px-5 py-3 text-right font-bold text-rose-600">
                  ฿{{ (mnt.cost || 0).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 5: Expenses Summary -->
      <div v-else-if="activeTab === 'expenses'" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShieldCheck :size="20" />
            </div>
            <div>
              <span class="text-xs font-medium text-slate-400 block">ค่าประกันภัยรวม</span>
              <span class="text-lg sm:text-xl font-bold text-slate-900">฿{{ (detailVehicle.expenseSummary?.insurance || 0).toLocaleString() }}</span>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <FileText :size="20" />
            </div>
            <div>
              <span class="text-xs font-medium text-slate-400 block">ค่า พ.ร.บ. + ภาษี</span>
              <span class="text-lg sm:text-xl font-bold text-slate-900">
                ฿{{ ((detailVehicle.expenseSummary?.prb || 0) + (detailVehicle.expenseSummary?.tax || 0)).toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Droplet :size="20" />
            </div>
            <div>
              <span class="text-xs font-medium text-slate-400 block">ค่าน้ำมันเครื่อง</span>
              <span class="text-lg sm:text-xl font-bold text-slate-900">฿{{ (detailVehicle.expenseSummary?.oil || 0).toLocaleString() }}</span>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Wrench :size="20" />
            </div>
            <div>
              <span class="text-xs font-medium text-slate-400 block">ค่าซ่อมบำรุงรวม</span>
              <span class="text-lg sm:text-xl font-bold text-slate-900">฿{{ (detailVehicle.expenseSummary?.maintenance || 0).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-blue-900">
              ยอดค่าใช้จ่ายรวมทั้งหมดของรถคันนี้
            </h3>
            <p class="text-xs sm:text-sm text-slate-600">
              รวมค่าประกัน พ.ร.บ. ทะเบียน น้ำมันเครื่อง และค่าซ่อมบำรุง
            </p>
          </div>
          <div class="text-3xl font-extrabold text-blue-700">
            ฿{{ (detailVehicle.expenseSummary?.grandTotal || 0).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- -------------------------------------------------------------
         ALL VEHICLES LIST TABLE
         ------------------------------------------------------------- -->
    <div v-else class="space-y-4">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-xs"
            placeholder="ค้นหาทะเบียน, ยี่ห้อ, รุ่น, ชื่อรถ..."
            v-model="searchTerm"
          />
        </div>

        <!-- Filter Controls & Add Button -->
        <div class="flex items-center gap-2">
          <select 
            class="px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="statusFilter"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="active">ใช้งานอยู่</option>
            <option value="inactive">ไม่ได้ใช้งาน</option>
          </select>

          <!-- Action Buttons (Admin Only) -->
          <div v-if="isAdmin" class="flex items-center gap-2">
            <AppButton variant="secondary" size="md" @click="handleOpenBulk" title="นำเข้าข้อมูลรถหลายคัน">
              <FileSpreadsheet :size="18" />
              <span class="hidden sm:inline">นำเข้า Excel</span>
            </AppButton>
            <AppButton variant="primary" size="md" @click="handleOpenAdd">
              <Plus :size="18" />
              <span>เพิ่มรถใหม่</span>
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Vehicles Table -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead class="bg-slate-50 text-base font-bold text-slate-800 border-b border-slate-200">
              <tr>
                <th class="px-5 py-4 whitespace-nowrap">รหัส</th>
                <th class="px-5 py-4 whitespace-nowrap">ทะเบียนรถ / จังหวัด</th>
                <th class="px-5 py-4 min-w-[200px]">ยี่ห้อ - รุ่น</th>
                <th class="px-5 py-4 min-w-[180px]">ชื่อ / ประเภท</th>
                <th class="px-5 py-4 whitespace-nowrap">สถานะรถ</th>
                <th class="px-5 py-4 whitespace-nowrap">ประกันภัย</th>
                <th class="px-5 py-4 whitespace-nowrap">ภาษี/ทะเบียน</th>
                <th class="px-5 py-4 text-center whitespace-nowrap w-36">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-if="filteredVehicles.length === 0">
                <td colspan="8" class="text-center py-12 text-slate-400 text-base">
                  <div v-if="vehicles.length === 0" class="flex flex-col items-center justify-center space-y-3 py-4">
                    <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                      <Truck :size="28" />
                    </div>
                    <div class="text-base font-semibold text-slate-700">ยังไม่มีข้อมูลรถในระบบ</div>
                    <p class="text-xs text-slate-500 max-w-sm text-center">
                      เริ่มต้นเพิ่มข้อมูลรถคันแรกของร้านโชคดีค้าข้าว หรือนำเข้าข้อมูลหลายคันพร้อมกันได้ทันที
                    </p>
                    <div v-if="isAdmin" class="flex items-center gap-2.5 pt-2">
                      <AppButton variant="primary" size="sm" @click="handleOpenAdd">
                        <Plus :size="15" />
                        <span>เพิ่มรถคันแรก</span>
                      </AppButton>
                      <AppButton variant="secondary" size="sm" @click="handleOpenBulk">
                        <FileSpreadsheet :size="15" />
                        <span>นำเข้าจาก Excel / หลายคัน</span>
                      </AppButton>
                    </div>
                    <div v-else class="text-xs text-slate-400">
                      กรุณาเข้าสู่ระบบผู้ดูแลระบบ (Admin) เพื่อเพิ่มข้อมูลรถ
                    </div>
                  </div>
                  <div v-else class="py-6 text-base">
                    ไม่พบข้อมูลรถตามเงื่อนไขที่ค้นหา
                  </div>
                </td>
              </tr>
              <tr 
                v-else 
                v-for="v in filteredVehicles" 
                :key="v.id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <td class="px-5 py-4.5 whitespace-nowrap font-extrabold text-blue-600 text-lg align-top">
                  {{ v.code }}
                </td>
                <td class="px-5 py-4.5 whitespace-nowrap align-top">
                  <div class="inline-block font-mono font-black text-lg bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs leading-tight">
                    {{ v.plateNumber }}
                  </div>
                  <div class="text-sm font-bold text-slate-500 mt-1">
                    {{ v.province }}
                  </div>
                  <div v-if="v.vin || v.engineNo" class="text-xs text-slate-600 font-mono mt-1.5 space-y-0.5 leading-tight">
                    <div v-if="v.vin" class="break-words" :title="'เลขตัวรถ: ' + v.vin">
                      <span class="text-slate-400 font-sans font-medium">คัสซี:</span> <span class="font-bold text-slate-800">{{ v.vin }}</span>
                    </div>
                    <div v-if="v.engineNo" class="break-words" :title="'เลขเครื่อง: ' + v.engineNo">
                      <span class="text-slate-400 font-sans font-medium">เครื่อง:</span> <span class="font-bold text-slate-800">{{ v.engineNo }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4.5 align-top max-w-[240px]">
                  <div class="font-bold text-slate-800 text-base leading-snug break-words">
                    {{ v.brand }} {{ v.model }}
                  </div>
                  <div class="text-sm font-medium text-slate-500 mt-1">
                    สี: {{ v.color || '-' }} | ปี {{ v.year || '-' }}
                  </div>
                </td>
                <td class="px-5 py-4.5 align-top max-w-[200px]">
                  <div v-if="v.name" class="font-bold text-blue-900 text-base bg-blue-100/90 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs inline-block mb-1">
                    {{ v.name }}
                  </div>
                  <div class="text-sm font-semibold text-blue-600 leading-snug">
                    {{ v.type }}
                  </div>
                </td>
                <td class="px-5 py-4.5 align-top whitespace-nowrap">
                  <StatusBadge :status="v.status" type="vehicleStatus" />
                </td>
                <td class="px-5 py-4.5 align-top whitespace-nowrap">
                  <StatusBadge v-if="v.latestInsurance" :days="v.insDaysRemaining" />
                  <span v-else class="text-base text-slate-400">-</span>
                </td>
                <td class="px-5 py-4.5 align-top whitespace-nowrap">
                  <StatusBadge v-if="v.latestTax" :days="v.taxDaysRemaining" />
                  <span v-else class="text-base text-slate-400">-</span>
                </td>
                <td class="px-5 py-4.5 align-top text-center whitespace-nowrap">
                  <div class="inline-flex items-center gap-2 pt-0.5">
                    <AppButton 
                      variant="secondary" 
                      size="sm"
                      @click="emit('selectVehicle', v.id)"
                      title="ดูรายละเอียดประวัติทั้งหมด"
                    >
                      <Eye :size="15" />
                      <span>ดูประวัติ</span>
                    </AppButton>
                    <button 
                      v-if="isAdmin"
                      class="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 hover:border-blue-300"
                      @click="handleOpenEdit(v)"
                      title="แก้ไขข้อมูล"
                      type="button"
                    >
                      <Edit2 :size="17" />
                    </button>
                    <button 
                      v-if="isAdmin"
                      class="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-300"
                      @click="handleDeleteVehicle(v)"
                      title="ลบข้อมูลรถ"
                      type="button"
                    >
                      <Trash2 :size="17" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <Modal
      :isOpen="isModalOpen"
      @close="isModalOpen = false"
      :title="editingId ? 'แก้ไขข้อมูลรถ' : 'เพิ่มรถคันใหม่ในระบบ'"
    >
      <form @submit.prevent="handleSaveVehicle" class="space-y-5">
        <!-- Section 1: ข้อมูลรถ -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. ข้อมูลทั่วไปของรถ
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">รหัสรถ <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.code"
                placeholder="เช่น CK-01"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ชื่อเรียก / ภารกิจ</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.name"
                placeholder="เช่น รถส่งข้าวสารถุง, รถลากจูง"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ทะเบียนรถ <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.plateNumber"
                placeholder="เช่น 1ฒม 9988 หรือ 70-1234"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">จังหวัด <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.province"
                placeholder="เช่น นครปฐม, กรุงเทพมหานคร"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ยี่ห้อ <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.brand"
                placeholder="เช่น Isuzu, Hino, Toyota"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">รุ่นรถ</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.model"
                placeholder="เช่น D-Max, Forward, Hilux"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ประเภทรถ</label>
              <select
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.type"
              >
                <option value="รถกระบะตอนเดียว">รถกระบะตอนเดียว</option>
                <option value="รถกระบะแค็บ">รถกระบะแค็บ</option>
                <option value="รถกระบะ 4 ประตู">รถกระบะ 4 ประตู</option>
                <option value="รถบรรทุก 4 ล้อ">รถบรรทุก 4 ล้อ</option>
                <option value="รถบรรทุก 6 ล้อ">รถบรรทุก 6 ล้อ</option>
                <option value="รถบรรทุก 10 ล้อ">รถบรรทุก 10 ล้อ</option>
                <option value="รถโฟล์คลิฟท์">รถโฟล์คลิฟท์</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">สถานะรถ</label>
              <select
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.status"
              >
                <option value="active">ใช้งานอยู่ (Active)</option>
                <option value="inactive">ไม่ได้ใช้งาน (Inactive)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 2: เลขตัวรถ และ เลขเครื่อง -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. เลขตัวถังและเครื่องยนต์
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เลขตัวรถ / คัสซี (VIN)</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.vin"
                placeholder="เช่น MP1TFR85..."
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">เลขเครื่องยนต์</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.engineNo"
                placeholder="เช่น 4JJ1-xxxxxx"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">สีรถ</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.color"
                placeholder="เช่น ขาว, บรอนซ์เงิน"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">ปีจดทะเบียน</label>
              <input
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.year"
                placeholder="เช่น 2022 หรือ 2565"
              />
            </div>
          </div>
        </div>

        <!-- Section 3: หมายเหตุและผู้บันทึก -->
        <div class="space-y-3">
          <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1">
            3. บันทึกและผู้จัดทำ
          </h4>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">หมายเหตุเพิ่มเติม</label>
            <textarea
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              rows="2"
              v-model="formData.notes"
              placeholder="รายละเอียดเฉพาะ เช่น รถประจำสาขา 2, ใช้เฉพาะขนส่งในเขตเทศบาล"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">ชื่อผู้บันทึก</label>
            <div class="flex items-center gap-2">
              <select
                v-if="!customCreatedByMode"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.createdBy"
              >
                <option v-for="staff in getStaffFormattedList" :key="staff.id" :value="staff.label">
                  {{ staff.label }}
                </option>
              </select>
              <input
                v-else
                type="text"
                class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.createdBy"
                placeholder="พิมพ์ชื่อผู้บันทึก..."
              />
              <button
                type="button"
                class="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap shadow-2xs"
                @click="customCreatedByMode = !customCreatedByMode"
              >
                {{ customCreatedByMode ? 'เลือกรายชื่อ' : 'พิมพ์เอง' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <AppButton variant="secondary" @click="isModalOpen = false" type="button">
            ยกเลิก
          </AppButton>
          <AppButton variant="primary" type="submit" :loading="saving">
            {{ editingId ? 'บันทึกการแก้ไข' : 'เพิ่มรถใหม่' }}
          </AppButton>
        </div>
      </form>
    </Modal>

    <!-- Bulk Import Modal -->
    <Modal
      :isOpen="isBulkModalOpen"
      @close="isBulkModalOpen = false"
      title="นำเข้าข้อมูลรถหลายคัน (Bulk Import)"
    >
      <div class="space-y-4">
        <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1 shadow-2xs">
          <div class="font-bold flex items-center gap-1.5">
            <FileSpreadsheet :size="16" class="text-blue-600" />
            <span>รูปแบบการวางข้อมูล (คั่นด้วย Tab จาก Excel หรือ เครื่องหมายจุลภาค ,)</span>
          </div>
          <p class="text-slate-600 leading-relaxed font-mono">
            รหัสรถ, ทะเบียนรถ, จังหวัด, ยี่ห้อ, รุ่น, ประเภท, วันหมดประกัน, วันครบต่อทะเบียน, วันหมด พ.ร.บ.
          </p>
          <div class="pt-1">
            <button 
              type="button" 
              class="text-blue-700 hover:underline font-bold text-xs inline-flex items-center gap-1"
              @click="insertSampleBulkText"
            >
              <span>+ ใส่ข้อมูลตัวอย่าง (3 คัน)</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1.5">วางข้อมูลรถจาก Excel / CSV ที่นี่:</label>
          <textarea
            class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            rows="6"
            v-model="bulkText"
            @input="parseBulkText"
            placeholder="CK-06, 70-5555, นครปฐม, Isuzu, Forward FRR 210, รถบรรทุก 6 ล้อ, 2026-12-01, 2026-11-15, 2026-12-01"
          ></textarea>
        </div>

        <!-- Preview Table -->
        <div v-if="parsedBulkList.length > 0" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">ตรวจสอบข้อมูลตัวอย่างที่พร้อมนำเข้า ({{ parsedBulkList.length }} คัน):</span>
          </div>
          <div class="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                <tr>
                  <th class="p-2">รหัส</th>
                  <th class="p-2">ทะเบียน</th>
                  <th class="p-2">ยี่ห้อ/รุ่น</th>
                  <th class="p-2">ประเภท</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600 font-mono">
                <tr v-for="(item, idx) in parsedBulkList" :key="idx">
                  <td class="p-2 font-bold text-blue-600">{{ item.code }}</td>
                  <td class="p-2">{{ item.plateNumber }} ({{ item.province }})</td>
                  <td class="p-2">{{ item.brand }} {{ item.model }}</td>
                  <td class="p-2">{{ item.type }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <AppButton variant="secondary" @click="isBulkModalOpen = false" type="button">
            ยกเลิก
          </AppButton>
          <AppButton 
            variant="primary" 
            @click="handleSaveBulk" 
            :loading="bulkSaving"
            :disabled="parsedBulkList.length === 0"
          >
            นำเข้า {{ parsedBulkList.length }} คัน
          </AppButton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { 
  Truck, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Droplet, 
  Wrench, 
  DollarSign, 
  Info, 
  FileCheck,
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
  selectedVehicleId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['selectVehicle', 'clearSelectedVehicle', 'renewDocument']);
const { isAdmin } = useAuth();
const { getStaffFormattedList, defaultStaffLabel, loadStaff } = useStaff();

const customCreatedByMode = ref(false);
const vehicles = ref([]);
const loading = ref(true);
const searchTerm = ref('');
const statusFilter = ref('all');

// Detail State
const detailVehicle = ref(null);
const detailLoading = ref(false);
const activeTab = ref('info');

// Modal State
const isModalOpen = ref(false);
const isBulkModalOpen = ref(false);
const editingId = ref(null);
const saving = ref(false);
const bulkSaving = ref(false);
const bulkText = ref('');
const parsedBulkList = ref([]);

const handleOpenBulk = () => {
  bulkText.value = '';
  parsedBulkList.value = [];
  isBulkModalOpen.value = true;
};

const insertSampleBulkText = () => {
  bulkText.value = `CK-06, 70-5555, นครปฐม, Isuzu, Forward FRR 210, รถบรรทุก 6 ล้อ, 2026-12-01, 2026-11-15, 2026-12-01
CK-07, 72-1234, นครปฐม, Hino, 500 FL8J, รถบรรทุก 10 ล้อ, 2026-10-10, 2026-10-15, 2026-10-10
CK-08, 1ฒม 3344, กรุงเทพมหานคร, Toyota, Hilux Revo, รถกระบะตอนเดียว, 2026-11-20, 2026-12-05, 2026-11-20`;
  parseBulkText();
};

const parseBulkText = () => {
  if (!bulkText.value.trim()) {
    parsedBulkList.value = [];
    return;
  }

  const lines = bulkText.value.trim().split('\n');
  const result = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return;
    // Split by tab or comma
    const parts = line.includes('\t') ? line.split('\t') : line.split(',');
    const clean = parts.map(p => p.trim());

    if (clean.length >= 2) {
      const code = clean[0] || `CK-${String(vehicles.value.length + index + 1).padStart(2, '0')}`;
      const plate = clean[1] || '';
      const province = clean[2] || 'นครปฐม';
      const brand = clean[3] || 'Isuzu';
      const model = clean[4] || '';
      const type = clean[5] || 'รถกระบะตอนเดียว';
      const insExp = clean[6] || '';
      const taxExp = clean[7] || '';
      const prbExp = clean[8] || '';

      if (plate) {
        result.push({
          code,
          plateNumber: plate,
          province,
          brand,
          model,
          type,
          name: `${brand} ${model}`.trim(),
          status: 'active',
          insuranceEndDate: insExp,
          taxExpireDate: taxExp,
          prbEndDate: prbExp,
          createdBy: 'นำเข้าข้อมูลด่วน'
        });
      }
    }
  });

  parsedBulkList.value = result;
};

const handleSaveBulk = async () => {
  if (parsedBulkList.value.length === 0) return;

  try {
    bulkSaving.value = true;
    const res = await api.bulkCreateVehicles(parsedBulkList.value);
    if (res.success) {
      alert(`นำเข้าข้อมูลรถสำเร็จเรียบร้อยแล้ว จำนวน ${res.count} คัน!`);
      isBulkModalOpen.value = false;
      await loadVehicles();
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการนำเข้า: ' + err.message);
  } finally {
    bulkSaving.value = false;
  }
};

const formData = ref({
  code: '',
  name: '',
  type: 'รถกระบะตอนเดียว',
  brand: '',
  model: '',
  color: '',
  plateNumber: '',
  province: 'กรุงเทพมหานคร',
  year: '2023',
  vin: '',
  engineNo: '',
  status: 'active',
  notes: '',
  createdBy: 'สมศักดิ์ ข้าวดี'
});

const loadVehicles = async () => {
  try {
    loading.value = true;
    const res = await api.getVehicles();
    if (res.success) {
      vehicles.value = res.data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadVehicleDetail = async (id) => {
  try {
    detailLoading.value = true;
    const res = await api.getVehicle(id);
    if (res.success) {
      detailVehicle.value = res.data;
    }
  } catch (err) {
    console.error(err);
  } finally {
    detailLoading.value = false;
  }
};

const handleQuickRenew = (item, type) => {
  emit('renewDocument', {
    type,
    vehicleId: detailVehicle.value?.id || item.vehicleId,
    rawDoc: item
  });
};

watch(() => props.selectedVehicleId, (newId) => {
  if (newId) {
    loadVehicleDetail(newId);
  } else {
    detailVehicle.value = null;
  }
}, { immediate: true });

onMounted(() => {
  loadVehicles();
  loadStaff();
});

const calcDaysRemaining = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const handleOpenAdd = () => {
  editingId.value = null;
  customCreatedByMode.value = false;
  formData.value = {
    code: `CK-${String(vehicles.value.length + 1).padStart(2, '0')}`,
    name: '',
    type: 'รถกระบะตอนเดียว',
    brand: '',
    model: '',
    color: '',
    plateNumber: '',
    province: 'นครปฐม',
    year: new Date().getFullYear().toString(),
    vin: '',
    engineNo: '',
    status: 'active',
    notes: '',
    createdBy: defaultStaffLabel.value
  };
  isModalOpen.value = true;
};

const handleOpenEdit = (v) => {
  editingId.value = v.id;
  const isCustom = !getStaffFormattedList.value.some(s => s.label === v.createdBy);
  customCreatedByMode.value = isCustom;
  formData.value = {
    code: v.code || '',
    name: v.name || '',
    type: v.type || 'รถกระบะตอนเดียว',
    brand: v.brand || '',
    model: v.model || '',
    color: v.color || '',
    plateNumber: v.plateNumber || '',
    province: v.province || 'นครปฐม',
    year: v.year || '',
    vin: v.vin || '',
    engineNo: v.engineNo || '',
    status: v.status || 'active',
    notes: v.notes || '',
    createdBy: v.createdBy || defaultStaffLabel.value
  };
  isModalOpen.value = true;
};

const handleSaveVehicle = async () => {
  if (!formData.value.plateNumber || !formData.value.brand) {
    alert('กรุณากรอกทะเบียนรถและยี่ห้อรถ');
    return;
  }

  try {
    saving.value = true;
    if (editingId.value) {
      await api.updateVehicle(editingId.value, formData.value);
    } else {
      await api.createVehicle(formData.value);
    }
    isModalOpen.value = false;
    await loadVehicles();
    if (props.selectedVehicleId) {
      await loadVehicleDetail(props.selectedVehicleId);
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
  } finally {
    saving.value = false;
  }
};

const handleDeleteVehicle = async (v) => {
  if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรถ ${v.code} (${v.plateNumber} ${v.province})? ข้อมูลประวัติที่เกี่ยวข้องจะถูกลบไปด้วย`)) {
    try {
      await api.deleteVehicle(v.id);
      if (props.selectedVehicleId === v.id) {
        emit('clearSelectedVehicle');
      }
      await loadVehicles();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบ: ' + err.message);
    }
  }
};

const filteredVehicles = computed(() => {
  return vehicles.value.filter((v) => {
    const q = searchTerm.value.toLowerCase();
    const matchQuery = 
      (v.plateNumber || '').toLowerCase().includes(q) ||
      (v.brand || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.name || '').toLowerCase().includes(q) ||
      (v.code || '').toLowerCase().includes(q) ||
      (v.province || '').toLowerCase().includes(q);
    
    const matchStatus = statusFilter.value === 'all' || v.status === statusFilter.value;
    return matchQuery && matchStatus;
  });
});
</script>
