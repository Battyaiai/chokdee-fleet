<template>
  <div class="space-y-6 print:space-y-3">
    <!-- Screen Controls (Hidden on Print) -->
    <div class="print:hidden bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <Filter :size="18" class="text-blue-600" />
          <h3 class="text-base font-bold text-slate-900">
            เลือกประเภทรายงานและเงื่อนไขการออกรายงาน
          </h3>
        </div>
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <AppButton 
            variant="primary" 
            size="md" 
            class="flex-1 sm:flex-initial justify-center shadow-sm"
            @click="handleDownloadPDF"
            :loading="generatingPdf"
            title="ดาวน์โหลดเป็นไฟล์ PDF คุณภาพสูง A4"
          >
            <FileDown :size="16" />
            <span class="font-bold">{{ generatingPdf ? 'กำลังสร้าง PDF...' : '📥 ดาวน์โหลด PDF' }}</span>
          </AppButton>

          <AppButton 
            variant="secondary" 
            size="md" 
            class="flex-1 sm:flex-initial justify-center"
            @click="handleExportCSV"
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ Excel (.csv)"
          >
            <FileSpreadsheet :size="16" />
            <span>ส่งออก Excel</span>
          </AppButton>

          <AppButton 
            variant="secondary" 
            size="md" 
            class="flex-1 sm:flex-initial justify-center"
            @click="handleOpenPrintWindow"
            title="เปิดหน้าต่างพิมพ์เอกสาร A4 และบันทึก PDF"
          >
            <Printer :size="16" />
            <span>พิมพ์ A4 / บันทึก PDF</span>
          </AppButton>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ประเภทรายงาน</label>
          <select
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="reportType"
          >
            <option value="fleet">1. รายการรถทั้งหมด (Fleet Summary)</option>
            <option value="docs">2. รายงานเอกสาร ประกัน / พ.ร.บ. / ทะเบียน</option>
            <option value="oil">3. รายงานประวัติน้ำมันเครื่อง</option>
            <option value="maintenance">4. รายงานประวัติการซ่อมบำรุง</option>
            <option value="expenses">5. รายงานสรุปค่าใช้จ่ายแยกช่วงเวลา</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">เลือกรถ</label>
          <select
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="selectedVehicleId"
          >
            <option value="all">รถทุกคันในร้าน</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">
              {{ v.code }} - {{ v.plateNumber }} ({{ v.brand }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ตั้งแต่วันที่</label>
          <input
            type="date"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="startDate"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">ถึงวันที่</label>
          <input
            type="date"
            class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            v-model="endDate"
          />
        </div>
      </div>
    </div>

    <!-- Printable & PDF Target Container (Fully Styled) -->
    <div 
      id="report-printable-area" 
      class="bg-white border border-slate-300 rounded-xl p-5 sm:p-7 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0 font-sans"
      style="font-family: 'Sarabun', 'Prompt', sans-serif;"
    >
      <!-- Printable Sheet Header -->
      <div class="border-b-2 border-slate-900 pb-3 mb-3 flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-950 tracking-tight" style="color: #0f172a; font-size: 18px; font-weight: 700;">
            ร้านโชคดีค้าข้าว (CHOKDEE RICE TRADING)
          </h2>
          <p class="text-xs text-slate-600 mt-1" style="color: #475569; font-size: 12px;">
            รายงานระบบจัดการข้อมูลรถยนต์และยานพาหนะ | ออกเมื่อ: {{ printDate }}
          </p>
        </div>
        <div class="text-right text-xs font-semibold" style="color: #334155; font-size: 11px; text-align: right;">
          <div>เอกสารทางการภายในร้าน</div>
          <div style="color: #2563eb; font-weight: 600;">พิมพ์เพื่อการตรวจสอบ</div>
        </div>
      </div>

      <!-- -------------------------------------------------------------
          REPORT 1: FLEET SUMMARY
          ------------------------------------------------------------- -->
      <div v-if="reportType === 'fleet'" class="space-y-3">
        <div class="flex items-center justify-between pb-1">
          <h3 class="text-sm sm:text-base font-bold" style="color: #0f172a; font-size: 14px; font-weight: 700;">
            1. รายงานข้อมูลรถทั้งหมด ร้านโชคดีค้าข้าว (จำนวน {{ activeVehicles.length }} คัน)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table 
            class="w-full text-left text-xs border-collapse" 
            style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #94a3b8;"
          >
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #94a3b8;">
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 65px;">รหัส</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 110px;">ทะเบียน / จังหวัด</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">ยี่ห้อ - รุ่น</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">ประเภทรถ</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: center; width: 60px;">ปี</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: center; width: 90px;">สถานะ</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 130px;">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(v, idx) in activeVehicles" 
                :key="v.id" 
                :style="{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }"
              >
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #2563eb;">{{ v.code }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                  <div style="font-weight: 700; color: #0f172a; font-family: monospace;">{{ v.plateNumber }}</div>
                  <div style="font-size: 10px; color: #64748b;">{{ v.province }}</div>
                </td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 600; color: #1e293b;">{{ v.brand }} {{ v.model }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #334155;">{{ v.type }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">{{ v.year || '-' }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle;">
                  <span 
                    :style="v.status === 'active' 
                      ? 'display: inline-block; padding: 3px 10px; line-height: 1.4; background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 9999px; font-weight: 600; font-size: 10.5px; white-space: nowrap;' 
                      : 'display: inline-block; padding: 3px 10px; line-height: 1.4; background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; border-radius: 9999px; font-size: 10.5px; white-space: nowrap;'"
                  >
                    {{ v.status === 'active' ? 'ใช้งานอยู่' : 'ซ่อม/พัก' }}
                  </span>
                </td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #64748b; font-size: 10.5px; vertical-align: middle;">{{ v.createdBy || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- -------------------------------------------------------------
          REPORT 2: DOCS EXPIRY STATUS
          ------------------------------------------------------------- -->
      <div v-else-if="reportType === 'docs'" class="space-y-3">
        <div class="flex items-center justify-between pb-1">
          <h3 class="text-sm sm:text-base font-bold" style="color: #0f172a; font-size: 14px; font-weight: 700;">
            2. รายงานสถานะเอกสาร ประกันภัย / พ.ร.บ. / ต่อทะเบียน (จำนวน {{ activeDocs.length }} รายการ)
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table 
            class="w-full text-left text-xs border-collapse" 
            style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #94a3b8;"
          >
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #94a3b8;">
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 65px;">รหัส</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 110px;">ทะเบียน</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 100px;">ประเภทเอกสาร</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">เลขที่ / บริษัท</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 95px;">วันหมดอายุ</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: right; width: 85px;">ค่าใช้จ่าย</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: center; width: 110px;">สถานะ</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 110px;">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(doc, idx) in activeDocs" 
                :key="idx" 
                :style="{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }"
              >
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #2563eb; vertical-align: middle;">{{ doc.vehicle?.code || '-' }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; font-family: monospace; vertical-align: middle;">{{ doc.vehicle?.plateNumber }} {{ doc.vehicle?.province }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a; vertical-align: middle;">{{ doc.docType }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #475569; vertical-align: middle;">{{ doc.docNumber || '-' }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a; vertical-align: middle;">{{ doc.expire || '-' }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; vertical-align: middle;">฿{{ (doc.costAmount || 0).toLocaleString() }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle;">
                  <span 
                    :style="doc.daysRemaining < 0 
                      ? 'display: inline-block; padding: 3px 10px; line-height: 1.4; background-color: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; border-radius: 9999px; font-weight: 600; font-size: 10.5px; white-space: nowrap;'
                      : doc.daysRemaining <= 30 
                      ? 'display: inline-block; padding: 3px 10px; line-height: 1.4; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; border-radius: 9999px; font-weight: 600; font-size: 10.5px; white-space: nowrap;'
                      : doc.daysRemaining <= 60 
                      ? 'display: inline-block; padding: 3px 10px; line-height: 1.4; background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; border-radius: 9999px; font-weight: 600; font-size: 10.5px; white-space: nowrap;'
                      : 'display: inline-block; padding: 3px 10px; line-height: 1.4; background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 9999px; font-weight: 600; font-size: 10.5px; white-space: nowrap;'"
                  >
                    {{ doc.daysRemaining < 0 ? `เลยกำหนด ${Math.abs(doc.daysRemaining)} วัน` : `เหลือ ${doc.daysRemaining} วัน` }}
                  </span>
                </td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #64748b; font-size: 10.5px; vertical-align: middle;">{{ doc.createdBy || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- -------------------------------------------------------------
          REPORT 3: OIL CHANGE HISTORY
          ------------------------------------------------------------- -->
      <div v-else-if="reportType === 'oil'" class="space-y-3">
        <div class="flex items-center justify-between pb-1">
          <h3 class="text-sm sm:text-base font-bold" style="color: #0f172a; font-size: 14px; font-weight: 700;">
            3. รายงานประวัติน้ำมันเครื่อง (ช่วง {{ startDate }} ถึง {{ endDate }})
          </h3>
          <span style="color: #1d4ed8; font-weight: 700; font-size: 13px;">
            ยอดรวม: ฿{{ totalOilSpend.toLocaleString() }}
          </span>
        </div>
        <div class="overflow-x-auto">
          <table 
            class="w-full text-left text-xs border-collapse" 
            style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #94a3b8;"
          >
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #94a3b8;">
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 85px;">วันที่</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 65px;">รหัส</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 110px;">ทะเบียน</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: right; width: 90px;">เลขไมล์</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">รายการน้ำมัน / รายละเอียด</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: right; width: 85px;">ค่าใช้จ่าย</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 85px;">นัดถัดไป</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 110px;">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="activeOil.length === 0">
                <td colspan="8" style="padding: 20px; text-align: center; color: #94a3b8;">ไม่พบประวัติน้ำมันเครื่องในช่วงวันที่นี้</td>
              </tr>
              <tr 
                v-else 
                v-for="(rec, idx) in activeOil" 
                :key="rec.id" 
                :style="{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }"
              >
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 500;">{{ rec.changeDate }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #2563eb;">{{ rec.vehicle?.code }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: 700;">{{ rec.vehicle?.plateNumber }} {{ rec.vehicle?.province }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600;">{{ (rec.currentMileage || 0).toLocaleString() }} กม.</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #1e293b;">{{ rec.oilDetails }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #0f172a;">฿{{ (rec.cost || 0).toLocaleString() }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #475569;">{{ rec.nextChangeDate || '-' }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #64748b; font-size: 10.5px;">{{ rec.createdBy || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- -------------------------------------------------------------
          REPORT 4: MAINTENANCE HISTORY
          ------------------------------------------------------------- -->
      <div v-else-if="reportType === 'maintenance'" class="space-y-3">
        <div class="flex items-center justify-between pb-1">
          <h3 class="text-sm sm:text-base font-bold" style="color: #0f172a; font-size: 14px; font-weight: 700;">
            4. รายงานประวัติซ่อมบำรุง (ช่วง {{ startDate }} ถึง {{ endDate }})
          </h3>
          <span style="color: #e11d48; font-weight: 700; font-size: 13px;">
            ยอดรวม: ฿{{ totalMntSpend.toLocaleString() }}
          </span>
        </div>
        <div class="overflow-x-auto">
          <table 
            class="w-full text-left text-xs border-collapse" 
            style="width: 100%; border-collapse: collapse; font-size: 11.5px; border: 1px solid #94a3b8;"
          >
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 2px solid #94a3b8;">
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 85px;">วันที่ซ่อม</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 65px;">รหัส</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 110px;">ทะเบียน</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: right; width: 85px;">เลขไมล์</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">รายละเอียดการซ่อม</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 120px;">อู่ / ร้านซ่อม</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; text-align: right; width: 85px;">ค่าใช้จ่าย</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b; width: 110px;">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="activeMnt.length === 0">
                <td colspan="8" style="padding: 20px; text-align: center; color: #94a3b8;">ไม่พบประวัติซ่อมบำรุงในช่วงวันที่นี้</td>
              </tr>
              <tr 
                v-else 
                v-for="(rec, idx) in activeMnt" 
                :key="rec.id" 
                :style="{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }"
              >
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 500;">{{ rec.repairDate }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700; color: #2563eb;">{{ rec.vehicle?.code }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: 700;">{{ rec.vehicle?.plateNumber }} {{ rec.vehicle?.province }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; color: #334155;">{{ (rec.mileage || 0).toLocaleString() }} กม.</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a;">{{ rec.description }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #475569;">{{ rec.garage || '-' }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700; color: #e11d48;">฿{{ (rec.cost || 0).toLocaleString() }}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #64748b; font-size: 10.5px;">{{ rec.createdBy || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- -------------------------------------------------------------
          REPORT 5: EXPENSES SUMMARY
          ------------------------------------------------------------- -->
      <div v-else-if="reportType === 'expenses'" class="space-y-4">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">ค่าประกันภัย</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">฿{{ totalInsSpend.toLocaleString() }}</div>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">ค่า พ.ร.บ. + ภาษี</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">฿{{ (totalPrbSpend + totalTaxSpend).toLocaleString() }}</div>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">ค่าน้ำมันเครื่อง</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">฿{{ totalOilSpend.toLocaleString() }}</div>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">ค่าซ่อมบำรุง</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a;">฿{{ totalMntSpend.toLocaleString() }}</div>
          </div>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 700; color: #1e3a8a; font-size: 14px;">รวมค่าใช้จ่ายทั้งหมดในช่วงวันที่เลือก</div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              ระหว่าง {{ startDate }} ถึง {{ endDate }} ({{ selectedVehicleId === 'all' ? 'รถทุกคันในร้าน' : 'รถที่เลือก' }})
            </div>
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #1d4ed8;">
            ฿{{ grandTotalSpend.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Printer, 
  FileDown, 
  Filter, 
  FileSpreadsheet
} from 'lucide-vue-next';
import html2pdf from 'html2pdf.js';
import { api } from '../api';
import AppButton from '../components/AppButton.vue';

const reportType = ref('fleet'); // fleet, docs, oil, maintenance, expenses
const vehicles = ref([]);
const selectedVehicleId = ref('all');
const startDate = ref('2025-01-01');
const endDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(true);
const generatingPdf = ref(false);

const insuranceList = ref([]);
const prbList = ref([]);
const taxList = ref([]);
const oilList = ref([]);
const mntList = ref([]);

const printDate = computed(() => {
  const d = new Date();
  return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH')}`;
});

const loadAllData = async () => {
  try {
    loading.value = true;
    const [vRes, insRes, prbRes, taxRes, oilRes, mntRes] = await Promise.all([
      api.getVehicles(),
      api.getInsurance(),
      api.getPrb(),
      api.getTax(),
      api.getOilChanges(),
      api.getMaintenances()
    ]);
    if (vRes.success) vehicles.value = vRes.data;
    if (insRes.success) insuranceList.value = insRes.data;
    if (prbRes.success) prbList.value = prbRes.data;
    if (taxRes.success) taxList.value = taxRes.data;
    if (oilRes.success) oilList.value = oilRes.data;
    if (mntRes.success) mntList.value = mntRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAllData();
});

const handlePrint = () => {
  window.print();
};

const handleOpenPrintWindow = () => {
  const element = document.getElementById('report-printable-area');
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>โชคดีค้าข้าว - รายงาน</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        @page { size: A4 portrait; margin: 8mm; }
        body { font-family: 'Sarabun', sans-serif; margin: 0; padding: 12px; color: #0f172a; background: #fff; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background-color: #f1f5f9; border: 1px solid #94a3b8; padding: 6px 8px; font-weight: bold; text-align: left; color: #1e293b; }
        td { border: 1px solid #cbd5e1; padding: 5px 8px; vertical-align: middle; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .no-print { display: block; margin-bottom: 12px; }
        @media print { .no-print { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: right; padding-bottom: 10px;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; font-family: 'Sarabun', sans-serif;">
          🖨️ สั่งพิมพ์ / บันทึก PDF (Print / Save)
        </button>
      </div>
      ${element.innerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

const handleDownloadPDF = async () => {
  const element = document.getElementById('report-printable-area');
  if (!element) return;

  try {
    generatingPdf.value = true;

    const opt = {
      margin: [6, 6, 6, 6],
      filename: `โชคดีค้าข้าว_รายงาน_${reportType.value}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('PDF Generation Error:', err);
    // Fallback: open clean print window
    handleOpenPrintWindow();
  } finally {
    generatingPdf.value = false;
  }
};

const handleExportCSV = () => {
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Thai language support
  let filename = `รายงาน_${reportType.value}.csv`;

  if (reportType.value === 'fleet') {
    csvContent += 'รหัสรถ,ทะเบียน,จังหวัด,ยี่ห้อ,รุ่น,ประเภท,ปี,สถานะ,ผู้บันทึก\n';
    activeVehicles.value.forEach(v => {
      csvContent += `"${v.code}","${v.plateNumber}","${v.province}","${v.brand}","${v.model}","${v.type}","${v.year || ''}","${v.status}","${v.createdBy || ''}"\n`;
    });
  } else if (reportType.value === 'docs') {
    csvContent += 'รหัสรถ,ทะเบียน,ประเภทเอกสาร,เลขที่/บริษัท,วันหมดอายุ,ค่าใช้จ่าย,ผู้บันทึก\n';
    activeDocs.value.forEach(d => {
      csvContent += `"${d.vehicle?.code || ''}","${d.vehicle?.plateNumber || ''} ${d.vehicle?.province || ''}","${d.docType}","${d.docNumber || ''}","${d.expire || ''}","${d.costAmount || 0}","${d.createdBy || ''}"\n`;
    });
  } else if (reportType.value === 'oil') {
    csvContent += 'วันที่,รหัสรถ,ทะเบียน,เลขไมล์,รายการน้ำมัน,ค่าใช้จ่าย,นัดถัดไป,ผู้บันทึก\n';
    activeOil.value.forEach(o => {
      csvContent += `"${o.changeDate}","${o.vehicle?.code || ''}","${o.vehicle?.plateNumber || ''} ${o.vehicle?.province || ''}","${o.currentMileage || 0}","${o.oilDetails || ''}","${o.cost || 0}","${o.nextChangeDate || ''}","${o.createdBy || ''}"\n`;
    });
  } else if (reportType.value === 'maintenance') {
    csvContent += 'วันที่ซ่อม,รหัสรถ,ทะเบียน,เลขไมล์,รายละเอียด,อู่/ร้านซ่อม,ค่าใช้จ่าย,ผู้บันทึก\n';
    activeMnt.value.forEach(m => {
      csvContent += `"${m.repairDate}","${m.vehicle?.code || ''}","${m.vehicle?.plateNumber || ''} ${m.vehicle?.province || ''}","${m.mileage || 0}","${m.description || ''}","${m.garage || ''}","${m.cost || 0}","${m.createdBy || ''}"\n`;
    });
  } else {
    csvContent += 'ประเภทค่าใช้จ่าย,จำนวนเงิน (บาท)\n';
    csvContent += `"ค่าประกันภัย","${totalInsSpend.value}"\n`;
    csvContent += `"ค่า พ.ร.บ. + ภาษี","${totalPrbSpend.value + totalTaxSpend.value}"\n`;
    csvContent += `"ค่าน้ำมันเครื่อง","${totalOilSpend.value}"\n`;
    csvContent += `"ค่าซ่อมบำรุง","${totalMntSpend.value}"\n`;
    csvContent += `"รวมค่าใช้จ่ายทั้งหมด","${grandTotalSpend.value}"\n`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const filterByVehicle = (list) => {
  if (selectedVehicleId.value === 'all') return list;
  return list.filter(item => item.vehicleId === selectedVehicleId.value);
};

const filterByDateRange = (list, dateField) => {
  return list.filter(item => {
    const d = item[dateField];
    if (!d) return false;
    return d >= startDate.value && d <= endDate.value;
  });
};

const activeVehicles = computed(() => {
  if (selectedVehicleId.value === 'all') return vehicles.value;
  return vehicles.value.filter(v => v.id === selectedVehicleId.value);
});

const activeOil = computed(() => {
  return filterByDateRange(filterByVehicle(oilList.value), 'changeDate');
});

const activeMnt = computed(() => {
  return filterByDateRange(filterByVehicle(mntList.value), 'repairDate');
});

const activeDocs = computed(() => {
  const all = [
    ...insuranceList.value.map(i => ({ ...i, docType: 'ประกันภัย', docNumber: i.policyNumber || i.company, expire: i.endDate, costAmount: i.premiumAmount })),
    ...prbList.value.map(p => ({ ...p, docType: 'พ.ร.บ.', docNumber: p.prbNumber, expire: p.endDate, costAmount: p.cost })),
    ...taxList.value.map(t => ({ ...t, docType: 'ภาษี/ต่อทะเบียน', docNumber: t.plateNumber, expire: t.expireDate, costAmount: t.cost }))
  ];
  return filterByVehicle(all);
});

const totalInsSpend = computed(() => {
  return filterByDateRange(filterByVehicle(insuranceList.value), 'startDate').reduce((s, i) => s + (Number(i.premiumAmount) || 0), 0);
});

const totalPrbSpend = computed(() => {
  return filterByDateRange(filterByVehicle(prbList.value), 'startDate').reduce((s, p) => s + (Number(p.cost) || 0), 0);
});

const totalTaxSpend = computed(() => {
  return filterByDateRange(filterByVehicle(taxList.value), 'lastRenewalDate').reduce((s, t) => s + (Number(t.cost) || 0), 0);
});

const totalOilSpend = computed(() => {
  return activeOil.value.reduce((s, o) => s + (Number(o.cost) || 0), 0);
});

const totalMntSpend = computed(() => {
  return activeMnt.value.reduce((s, m) => s + (Number(m.cost) || 0), 0);
});

const grandTotalSpend = computed(() => {
  return totalInsSpend.value + totalPrbSpend.value + totalTaxSpend.value + totalOilSpend.value + totalMntSpend.value;
});
</script>
