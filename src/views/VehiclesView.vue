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
            <span class="text-xs font-medium text-slate-400 block">เลขตัวถัง (VIN):</span>
            <p class="font-mono font-semibold text-slate-800 text-sm mt-0.5">{{ detailVehicle.vin || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">เลขเครื่องยนต์:</span>
            <p class="font-mono font-semibold text-slate-800 text-sm mt-0.5">{{ detailVehicle.engineNo || '-' }}</p>
          </div>
          <div>
            <span class="text-xs font-medium text-slate-400 block">ผู้บันทึกข้อมูล:</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ detailVehicle.createdBy || '-' }}</p>
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
              <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
                <tr>
                  <th class="px-5 py-3">บริษัทประกัน</th>
                  <th class="px-5 py-3">เลขกรมธรรม์</th>
                  <th class="px-5 py-3">วันเริ่ม</th>
                  <th class="px-5 py-3">วันหมดประกัน</th>
                  <th class="px-5 py-3">เบี้ยประกัน</th>
                  <th class="px-5 py-3">สถานะวันหมดอายุ</th>
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
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 3: Oil Changes -->
      <div v-else-if="activeTab === 'oil'" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Droplet :size="18" class="text-blue-600" />
          <h4 class="font-bold text-sm text-slate-900">ประวัติเปลี่ยนถ่ายน้ำมันเครื่อง ({{ detailVehicle.plateNumber }})</h4>
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
                <th class="px-5 py-3">ผู้บันทึก</th>
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
                <td class="px-5 py-3 text-xs text-slate-500">{{ oil.createdBy || '-' }}</td>
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
                <th class="px-5 py-3">ผู้บันทึก</th>
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
                <td class="px-5 py-3 text-xs text-slate-500">{{ mnt.createdBy || '-' }}</td>
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
            class="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="statusFilter"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="active">ใช้งานอยู่</option>
            <option value="inactive">ไม่ได้ใช้งาน</option>
          </select>

          <div v-if="isAdmin" class="flex items-center gap-2">
            <AppButton variant="secondary" size="md" @click="handleOpenBulk">
              <FileSpreadsheet :size="16" />
              <span>นำเข้าจาก Excel / หลายคัน</span>
            </AppButton>

            <AppButton variant="primary" size="md" @click="handleOpenAdd">
              <Plus :size="16" />
              <span>เพิ่มรถใหม่</span>
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Vehicles Table -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse min-w-[900px]">
            <thead class="bg-slate-50 text-xs font-semibold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th class="px-5 py-3">รหัส</th>
                <th class="px-5 py-3">ทะเบียนรถ / จังหวัด</th>
                <th class="px-5 py-3">ยี่ห้อ - รุ่น</th>
                <th class="px-5 py-3">ชื่อ / ประเภท</th>
                <th class="px-5 py-3">สถานะรถ</th>
                <th class="px-5 py-3">ประกันภัย</th>
                <th class="px-5 py-3">ภาษี/ทะเบียน</th>
                <th class="px-5 py-3">ผู้บันทึก</th>
                <th class="px-5 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-if="filteredVehicles.length === 0">
                <td colspan="9" class="text-center py-12 text-slate-400">
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
                  <div v-else class="py-6">
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
                <td class="px-5 py-3.5 whitespace-nowrap font-bold text-blue-600">
                  {{ v.code }}
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <div class="font-bold text-slate-900">{{ v.plateNumber }}</div>
                  <div class="text-xs text-slate-400">{{ v.province }}</div>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <div class="font-semibold text-slate-800">{{ v.brand }} {{ v.model }}</div>
                  <div class="text-xs text-slate-400">สี: {{ v.color || '-' }} | ปี {{ v.year || '-' }}</div>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <div class="text-slate-800 font-medium">{{ v.name }}</div>
                  <div class="text-xs text-slate-400">{{ v.type }}</div>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <StatusBadge :status="v.status" type="vehicleStatus" />
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <StatusBadge v-if="v.latestInsurance" :days="v.insDaysRemaining" />
                  <span v-else class="text-xs text-slate-400">-</span>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <StatusBadge v-if="v.latestTax" :days="v.taxDaysRemaining" />
                  <span v-else class="text-xs text-slate-400">-</span>
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                  {{ v.createdBy || '-' }}
                </td>
                <td class="px-5 py-3.5 whitespace-nowrap text-center">
                  <div class="inline-flex items-center gap-1.5">
                    <AppButton 
                      variant="secondary" 
                      size="sm"
                      @click="emit('selectVehicle', v.id)"
                      title="ดูรายละเอียดประวัติทั้งหมด"
                    >
                      <Eye :size="13" />
                      <span>ดูประวัติ</span>
                    </AppButton>
                    <button 
                      v-if="isAdmin"
                      class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      @click="handleOpenEdit(v)"
                      title="แก้ไขข้อมูล"
                      type="button"
                    >
                      <Edit2 :size="15" />
                    </button>
                    <button 
                      v-if="isAdmin"
                      class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      @click="handleDeleteVehicle(v)"
                      title="ลบข้อมูลรถ"
                      type="button"
                    >
                      <Trash2 :size="15" />
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
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. ข้อมูลรถพื้นฐาน
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">รหัสรถประจำร้าน <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.code"
                placeholder="เช่น CK-01"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ประเภทรถ</label>
              <select class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs" v-model="formData.type">
                <option value="รถบรรทุก 12 ล้อ">รถบรรทุก 12 ล้อ</option>
                <option value="รถบรรทุก 10 ล้อ">รถบรรทุก 10 ล้อ</option>
                <option value="รถบรรทุก 6 ล้อ">รถบรรทุก 6 ล้อ</option>
                <option value="รถกระบะตอนเดียว">รถกระบะตอนเดียว (ตู้ทึบ/คอก)</option>
                <option value="รถกระบะ 4 ประตู">รถกระบะ 4 ประตู</option>
                <option value="รถตู้">รถตู้</option>
                <option value="รถโฟล์คลิฟท์">รถโฟล์คลิฟท์</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ยี่ห้อ <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.brand"
                placeholder="เช่น Isuzu, Toyota, Hino"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">รุ่น</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.model"
                placeholder="เช่น Forward 210, Hilux Revo"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อเรียก / หน้าที่รถ</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.name"
                placeholder="เช่น รถส่งข้าวเปลือก, รถตรวจงาน"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">สีรถ</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.color"
                placeholder="เช่น ขาว, น้ำเงิน"
              />
            </div>
          </div>
        </div>

        <!-- Section 2: ทะเบียนและตัวถัง -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. ทะเบียนและเอกสารตัวถัง
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ทะเบียนรถ <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.plateNumber"
                placeholder="เช่น 70-1234 หรือ 2ฒข 4411"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">จังหวัด <span class="text-rose-500">*</span></label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.province"
                placeholder="เช่น นครปฐม, กรุงเทพมหานคร"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ปีรถ (ค.ศ. หรือ พ.ศ.)</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                v-model="formData.year"
                placeholder="เช่น 2023"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">สถานะการใช้งาน</label>
              <select class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs" v-model="formData.status">
                <option value="active">ใช้งานอยู่</option>
                <option value="inactive">ไม่ได้ใช้งาน / ซ่อมพัก</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขตัวถัง (VIN)</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.vin"
                placeholder="เลขตัวถัง 17 หลัก"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">เลขเครื่องยนต์</label>
              <input
                type="text"
                class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs font-mono"
                v-model="formData.engineNo"
                placeholder="เลขเครื่องยนต์"
              />
            </div>
          </div>
        </div>

        <!-- Section 3: หมายเหตุและผู้บันทึก -->
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
                placeholder="ระบุข้อควรระวังหรือรายละเอียดพิเศษ..."
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
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลรถ' }}
          </AppButton>
        </div>
      </form>
    </Modal>

    <!-- Bulk Import Modal -->
    <Modal
      :isOpen="isBulkModalOpen"
      @close="isBulkModalOpen = false"
      title="นำเข้าข้อมูลรถจาก Excel / หลายคันพร้อมกัน"
    >
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-1.5">
          <div class="font-bold text-blue-900 flex items-center justify-between">
            <span>💡 วิธีนำเข้าข้อมูลด่วนจาก Excel / ตาราง:</span>
            <button 
              type="button" 
              class="text-blue-700 underline font-semibold hover:text-blue-900"
              @click="insertSampleBulkText"
            >
              คลิกเพื่อใส่ตัวอย่างข้อมูล
            </button>
          </div>
          <p>
            คัดลอกตารางจาก <strong>Excel</strong> หรือพิมพ์ 1 บรรทัดต่อ 1 คัน โดยคั่นด้วยเครื่องหมายจุลภาค <code>,</code> หรือแท็บ (Tab):
          </p>
          <div class="font-mono bg-white p-2 rounded border border-blue-100 text-[11px] text-slate-800">
            รหัสรถ, ทะเบียน, จังหวัด, ยี่ห้อ, รุ่น, ประเภทรถ, วันหมดประกัน, วันต่อภาษี, วันหมดพรบ
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            วางข้อมูลรถที่นี่ (คัดลอกจาก Excel ได้เลย)
          </label>
          <textarea
            class="w-full h-36 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="bulkText"
            placeholder="CK-06, 70-5555, นครปฐม, Isuzu, Forward, รถบรรทุก 6 ล้อ, 2026-12-01, 2026-11-15, 2026-12-01&#10;CK-07, 72-1234, นครปฐม, Hino, 500, รถบรรทุก 10 ล้อ, 2026-10-10, 2026-10-15, 2026-10-10"
            @input="parseBulkText"
          />
        </div>

        <!-- Preview Table -->
        <div v-if="parsedBulkList.length > 0" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-800">
              ตัวอย่างรายการที่จะนำเข้า ({{ parsedBulkList.length }} คัน):
            </span>
            <span class="text-xs text-emerald-600 font-semibold">✓ ตรวจสอบข้อมูลเรียบร้อย</span>
          </div>

          <div class="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                <tr>
                  <th class="p-2">รหัส</th>
                  <th class="p-2">ทะเบียน</th>
                  <th class="p-2">จังหวัด</th>
                  <th class="p-2">ยี่ห้อ/รุ่น</th>
                  <th class="p-2">ประกัน</th>
                  <th class="p-2">ภาษี</th>
                  <th class="p-2">พ.ร.บ.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr v-for="(item, idx) in parsedBulkList" :key="idx" class="hover:bg-slate-50">
                  <td class="p-2 font-bold text-blue-600">{{ item.code }}</td>
                  <td class="p-2 font-bold font-mono">{{ item.plateNumber }}</td>
                  <td class="p-2">{{ item.province }}</td>
                  <td class="p-2">{{ item.brand }} {{ item.model }}</td>
                  <td class="p-2">{{ item.insuranceEndDate || '-' }}</td>
                  <td class="p-2">{{ item.taxExpireDate || '-' }}</td>
                  <td class="p-2">{{ item.prbEndDate || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <AppButton variant="secondary" @click="isBulkModalOpen = false">
            ยกเลิก
          </AppButton>
          <AppButton 
            variant="primary" 
            :disabled="parsedBulkList.length === 0" 
            :loading="bulkSaving"
            @click="handleSaveBulk"
          >
            {{ bulkSaving ? 'กำลังนำเข้า...' : `ยืนยันนำเข้าข้อมูล (${parsedBulkList.length} คัน)` }}
          </AppButton>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { 
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
  Truck
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

const emit = defineEmits(['selectVehicle', 'clearSelectedVehicle']);
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
