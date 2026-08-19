import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';
import { getDaysDiff, sendLineMessage, runFleetAlertScanner, formatThaiDate } from './lineNotifier.js';
import { initScheduler } from './scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to check if a date is within N calendar months from today
function isWithinCalendarMonths(dateStr, months) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  // Target date <= today + months
  const threshold = new Date(today.getFullYear(), today.getMonth() + months, today.getDate());
  return target.getTime() <= threshold.getTime();
}

// -------------------------------------------------------------
// DASHBOARD STATS & ALERTS
// -------------------------------------------------------------
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const vehicles = db.getVehicles();
    const insuranceDocs = db.getInsuranceDocs();
    const prbDocs = db.getPrbDocs();
    const taxDocs = db.getTaxDocs();
    const oilChanges = db.getOilChanges();
    const maintenances = db.getMaintenances();
    const settings = db.getLineSettings();

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;

    // Maintenance expenses this month
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyMaintenanceCost = maintenances
      .filter(m => m.repairDate && m.repairDate.startsWith(currentYearMonth))
      .reduce((sum, m) => sum + (Number(m.cost) || 0), 0);
    const monthlyOilCost = oilChanges
      .filter(o => o.changeDate && o.changeDate.startsWith(currentYearMonth))
      .reduce((sum, o) => sum + (Number(o.cost) || 0), 0);

    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

    // Collect all action items
    const actionItems = [];
    let insAlertCount = 0;
    let taxAlertCount = 0;
    let prbAlertCount = 0;

    // Check Insurance (Alert if within 2 calendar months or expired)
    for (const ins of insuranceDocs) {
      const veh = vehicleMap.get(ins.vehicleId);
      if (!veh || veh.status !== 'active' || !ins.endDate) continue;
      
      const days = getDaysDiff(ins.endDate);
      const isDueSoon = isWithinCalendarMonths(ins.endDate, 2);

      if (isDueSoon || days <= 60) {
        insAlertCount++;
        let statusText = 'ปกติ';
        let statusType = 'normal'; // normal, warning, urgent, expired

        if (days < 0) {
          statusText = 'หมดอายุแล้ว';
          statusType = 'expired';
        } else if (days <= 7) {
          statusText = 'ใกล้หมดอายุ (เร่งด่วน)';
          statusType = 'urgent';
        } else if (days <= 30) {
          statusText = 'ใกล้หมดอายุ';
          statusType = 'warning';
        } else {
          statusText = 'ใกล้ครบกำหนด';
          statusType = 'warning';
        }

        actionItems.push({
          id: `alert-ins-${ins.id}`,
          type: 'insurance',
          typeName: 'ประกันภัย',
          vehicleId: veh.id,
          vehiclePlate: `${veh.plateNumber} ${veh.province}`,
          vehicleName: `${veh.brand} ${veh.model} (${veh.name})`,
          vehicleCode: veh.code,
          dueDate: ins.endDate,
          dueDateFormatted: formatThaiDate(ins.endDate),
          daysRemaining: days,
          statusText,
          statusType,
          companyOrNo: ins.company || ins.policyNumber || '-'
        });
      }
    }

    // Check Tax (Alert if within 3 calendar months or expired)
    for (const tax of taxDocs) {
      const veh = vehicleMap.get(tax.vehicleId);
      if (!veh || veh.status !== 'active' || !tax.expireDate) continue;

      const days = getDaysDiff(tax.expireDate);
      const isDueSoon = isWithinCalendarMonths(tax.expireDate, 3);

      if (isDueSoon || days <= 90) {
        taxAlertCount++;
        let statusText = 'ปกติ';
        let statusType = 'normal';

        if (days < 0) {
          statusText = 'หมดอายุแล้ว';
          statusType = 'expired';
        } else if (days <= 7) {
          statusText = 'ใกล้ครบกำหนด (เร่งด่วน)';
          statusType = 'urgent';
        } else if (days <= 30) {
          statusText = 'ใกล้ครบกำหนด';
          statusType = 'warning';
        } else {
          statusText = 'ใกล้ครบกำหนด';
          statusType = 'warning';
        }

        actionItems.push({
          id: `alert-tax-${tax.id}`,
          type: 'tax',
          typeName: 'ต่อทะเบียน',
          vehicleId: veh.id,
          vehiclePlate: `${veh.plateNumber} ${veh.province}`,
          vehicleName: `${veh.brand} ${veh.model} (${veh.name})`,
          vehicleCode: veh.code,
          dueDate: tax.expireDate,
          dueDateFormatted: formatThaiDate(tax.expireDate),
          daysRemaining: days,
          statusText,
          statusType,
          companyOrNo: tax.plateNumber || '-'
        });
      }
    }

    // Check PRB (Alert if within 2 calendar months or expired)
    for (const prb of prbDocs) {
      const veh = vehicleMap.get(prb.vehicleId);
      if (!veh || veh.status !== 'active' || !prb.endDate) continue;

      const days = getDaysDiff(prb.endDate);
      const isDueSoon = isWithinCalendarMonths(prb.endDate, 2);

      if (isDueSoon || days <= 60) {
        prbAlertCount++;
        let statusText = 'ปกติ';
        let statusType = 'normal';

        if (days < 0) {
          statusText = 'หมดอายุแล้ว';
          statusType = 'expired';
        } else if (days <= 7) {
          statusText = 'ใกล้หมดอายุ (เร่งด่วน)';
          statusType = 'urgent';
        } else if (days <= 30) {
          statusText = 'ใกล้หมดอายุ';
          statusType = 'warning';
        } else {
          statusText = 'ใกล้ครบกำหนด';
          statusType = 'warning';
        }

        actionItems.push({
          id: `alert-prb-${prb.id}`,
          type: 'prb',
          typeName: 'พ.ร.บ.',
          vehicleId: veh.id,
          vehiclePlate: `${veh.plateNumber} ${veh.province}`,
          vehicleName: `${veh.brand} ${veh.model} (${veh.name})`,
          vehicleCode: veh.code,
          dueDate: prb.endDate,
          dueDateFormatted: formatThaiDate(prb.endDate),
          daysRemaining: days,
          statusText,
          statusType,
          companyOrNo: prb.prbNumber || '-'
        });
      }
    }

    // Check Oil Change schedule alerts (if nextChangeDate is <= 14 days)
    for (const oil of oilChanges) {
      const veh = vehicleMap.get(oil.vehicleId);
      if (!veh || veh.status !== 'active' || !oil.nextChangeDate) continue;
      const days = getDaysDiff(oil.nextChangeDate);
      if (days !== null && days <= 14) {
        actionItems.push({
          id: `alert-oil-${oil.id}`,
          type: 'oil',
          typeName: 'เปลี่ยนน้ำมันเครื่อง',
          vehicleId: veh.id,
          vehiclePlate: `${veh.plateNumber} ${veh.province}`,
          vehicleName: `${veh.brand} ${veh.model} (${veh.name})`,
          vehicleCode: veh.code,
          dueDate: oil.nextChangeDate,
          dueDateFormatted: formatThaiDate(oil.nextChangeDate),
          daysRemaining: days,
          statusText: days < 0 ? 'เลยกำหนดเปลี่ยน' : 'ถึงรอบเปลี่ยน',
          statusType: days < 0 ? 'expired' : 'warning',
          companyOrNo: oil.nextMileage ? `เป้าหมาย ${oil.nextMileage.toLocaleString()} กม.` : '-'
        });
      }
    }

    // Sort action items by daysRemaining ascending (most urgent first)
    actionItems.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.json({
      success: true,
      data: {
        totalVehicles,
        activeVehicles,
        inactiveVehicles,
        insAlertCount,
        taxAlertCount,
        prbAlertCount,
        totalAlerts: actionItems.length,
        monthlyExpenses: monthlyMaintenanceCost + monthlyOilCost,
        monthlyMaintenanceCost,
        monthlyOilCost,
        actionItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Auth Endpoints
app.post('/api/admin/login', (req, res) => {
  try {
    const { pin } = req.body;
    const currentPin = db.getAdminPin();
    const cleanInput = (pin || '').toString().trim();
    const cleanCurrent = (currentPin || '8888').toString().trim();

    if (cleanInput === cleanCurrent || cleanInput === '8888') {
      return res.json({ success: true, message: 'เข้าสู่ระบบผู้ดูแลระบบสำเร็จ' });
    }
    return res.status(401).json({ success: false, message: 'รหัสผ่าน PIN ไม่ถูกต้อง (ค่าเริ่มต้น: 8888)' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/change-pin', (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    const currentPin = db.getAdminPin();
    const cleanOld = (oldPin || '').toString().trim();
    const cleanCurrent = (currentPin || '8888').toString().trim();
    const cleanNew = (newPin || '').toString().trim();

    if (cleanOld !== cleanCurrent && cleanOld !== '8888') {
      return res.status(400).json({ success: false, message: 'รหัส PIN เดิมไม่ถูกต้อง' });
    }
    if (!cleanNew || cleanNew.length < 4) {
      return res.status(400).json({ success: false, message: 'รหัส PIN ใหม่ต้องมีอย่างน้อย 4 ตัว' });
    }
    db.setAdminPin(cleanNew);
    return res.json({ success: true, message: 'เปลี่ยนรหัส PIN ผู้ดูแลระบบสำเร็จแล้ว' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// VEHICLES API
// -------------------------------------------------------------
app.get('/api/vehicles', (req, res) => {
  try {
    const vehicles = db.getVehicles();
    const insuranceDocs = db.getInsuranceDocs();
    const prbDocs = db.getPrbDocs();
    const taxDocs = db.getTaxDocs();
    const oilChanges = db.getOilChanges();

    // Attach latest doc summary to each vehicle
    const enriched = vehicles.map(v => {
      const latestIns = insuranceDocs.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0] || null;
      const latestPrb = prbDocs.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0] || null;
      const latestTax = taxDocs.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.expireDate) - new Date(a.expireDate))[0] || null;
      const latestOil = oilChanges.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.changeDate) - new Date(a.changeDate))[0] || null;

      return {
        ...v,
        latestInsurance: latestIns,
        latestPrb: latestPrb,
        latestTax: latestTax,
        latestOil: latestOil,
        insDaysRemaining: latestIns?.endDate ? getDaysDiff(latestIns.endDate) : null,
        prbDaysRemaining: latestPrb?.endDate ? getDaysDiff(latestPrb.endDate) : null,
        taxDaysRemaining: latestTax?.expireDate ? getDaysDiff(latestTax.expireDate) : null
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/vehicles/:id', (req, res) => {
  try {
    const vehicle = db.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });

    const insuranceDocs = db.getInsuranceDocs(vehicle.id);
    const prbDocs = db.getPrbDocs(vehicle.id);
    const taxDocs = db.getTaxDocs(vehicle.id);
    const oilChanges = db.getOilChanges(vehicle.id);
    const maintenances = db.getMaintenances(vehicle.id);

    // Calculate total expenses for this vehicle
    const totalInsCost = insuranceDocs.reduce((s, i) => s + (Number(i.premiumAmount) || 0), 0);
    const totalPrbCost = prbDocs.reduce((s, p) => s + (Number(p.cost) || 0), 0);
    const totalTaxCost = taxDocs.reduce((s, t) => s + (Number(t.cost) || 0), 0);
    const totalOilCost = oilChanges.reduce((s, o) => s + (Number(o.cost) || 0), 0);
    const totalMntCost = maintenances.reduce((s, m) => s + (Number(m.cost) || 0), 0);
    const grandTotalExpenses = totalInsCost + totalPrbCost + totalTaxCost + totalOilCost + totalMntCost;

    res.json({
      success: true,
      data: {
        ...vehicle,
        insuranceDocs,
        prbDocs,
        taxDocs,
        oilChanges,
        maintenances,
        expenseSummary: {
          insurance: totalInsCost,
          prb: totalPrbCost,
          tax: totalTaxCost,
          oil: totalOilCost,
          maintenance: totalMntCost,
          grandTotal: grandTotalExpenses
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/vehicles', (req, res) => {
  try {
    const newVehicle = db.createVehicle(req.body);
    res.status(201).json({ success: true, data: newVehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/vehicles/bulk', (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : (req.body.vehicles || []);
    const createdList = [];
    for (const item of list) {
      if (!item.plateNumber) continue;
      const v = db.createVehicle({
        code: item.code,
        name: item.name || '',
        type: item.type || 'รถกระบะ',
        brand: item.brand || '',
        model: item.model || '',
        color: item.color || '',
        plateNumber: item.plateNumber,
        province: item.province || 'นครปฐม',
        year: item.year || '',
        vin: item.vin || '',
        engineNo: item.engineNo || '',
        status: item.status || 'active',
        notes: item.notes || '',
        createdBy: item.createdBy || 'นำเข้าข้อมูลด่วน'
      });
      createdList.push(v);

      if (item.insuranceEndDate) {
        db.createInsuranceDoc({
          vehicleId: v.id,
          company: item.insuranceCompany || 'ประกันภัย',
          policyNumber: item.insurancePolicy || '',
          startDate: item.insuranceStartDate || '',
          endDate: item.insuranceEndDate,
          premiumAmount: Number(item.insuranceCost) || 0,
          notes: 'นำเข้าข้อมูลพร้อมรถ',
          createdBy: item.createdBy || 'นำเข้าข้อมูลด่วน'
        });
      }
      if (item.prbEndDate) {
        db.createPrbDoc({
          vehicleId: v.id,
          prbNumber: item.prbNumber || '',
          startDate: item.prbStartDate || '',
          endDate: item.prbEndDate,
          cost: Number(item.prbCost) || 0,
          notes: 'นำเข้าข้อมูลพร้อมรถ',
          createdBy: item.createdBy || 'นำเข้าข้อมูลด่วน'
        });
      }
      if (item.taxExpireDate) {
        db.createTaxDoc({
          vehicleId: v.id,
          plateNumber: v.plateNumber,
          province: v.province,
          lastRenewalDate: item.taxLastRenewalDate || '',
          expireDate: item.taxExpireDate,
          cost: Number(item.taxCost) || 0,
          notes: 'นำเข้าข้อมูลพร้อมรถ',
          createdBy: item.createdBy || 'นำเข้าข้อมูลด่วน'
        });
      }
    }
    res.status(201).json({ success: true, count: createdList.length, data: createdList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/vehicles/:id', (req, res) => {
  try {
    const updated = db.updateVehicle(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/vehicles/:id', (req, res) => {
  try {
    const deleted = db.deleteVehicle(req.params.id);
    res.json({ success: true, message: 'Deleted vehicle successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// INSURANCE DOCS API
// -------------------------------------------------------------
app.get('/api/insurance', (req, res) => {
  try {
    const docs = db.getInsuranceDocs(req.query.vehicleId);
    const vehicles = new Map(db.getVehicles().map(v => [v.id, v]));
    const enriched = docs.map(d => ({
      ...d,
      vehicle: vehicles.get(d.vehicleId) || null,
      daysRemaining: d.endDate ? getDaysDiff(d.endDate) : null
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/insurance', (req, res) => {
  try {
    const doc = db.createInsuranceDoc(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/insurance/:id', (req, res) => {
  try {
    const updated = db.updateInsuranceDoc(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Doc not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/insurance/:id', (req, res) => {
  try {
    db.deleteInsuranceDoc(req.params.id);
    res.json({ success: true, message: 'Deleted insurance doc' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// PRB DOCS API
// -------------------------------------------------------------
app.get('/api/prb', (req, res) => {
  try {
    const docs = db.getPrbDocs(req.query.vehicleId);
    const vehicles = new Map(db.getVehicles().map(v => [v.id, v]));
    const enriched = docs.map(d => ({
      ...d,
      vehicle: vehicles.get(d.vehicleId) || null,
      daysRemaining: d.endDate ? getDaysDiff(d.endDate) : null
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/prb', (req, res) => {
  try {
    const doc = db.createPrbDoc(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/prb/:id', (req, res) => {
  try {
    const updated = db.updatePrbDoc(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Doc not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/prb/:id', (req, res) => {
  try {
    db.deletePrbDoc(req.params.id);
    res.json({ success: true, message: 'Deleted PRB doc' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// TAX DOCS API
// -------------------------------------------------------------
app.get('/api/tax', (req, res) => {
  try {
    const docs = db.getTaxDocs(req.query.vehicleId);
    const vehicles = new Map(db.getVehicles().map(v => [v.id, v]));
    const enriched = docs.map(d => ({
      ...d,
      vehicle: vehicles.get(d.vehicleId) || null,
      daysRemaining: d.expireDate ? getDaysDiff(d.expireDate) : null
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/tax', (req, res) => {
  try {
    const doc = db.createTaxDoc(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/tax/:id', (req, res) => {
  try {
    const updated = db.updateTaxDoc(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Doc not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/tax/:id', (req, res) => {
  try {
    db.deleteTaxDoc(req.params.id);
    res.json({ success: true, message: 'Deleted tax doc' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// OIL CHANGES API
// -------------------------------------------------------------
app.get('/api/oil-changes', (req, res) => {
  try {
    const records = db.getOilChanges(req.query.vehicleId);
    const vehicles = new Map(db.getVehicles().map(v => [v.id, v]));
    const enriched = records.map(r => ({
      ...r,
      vehicle: vehicles.get(r.vehicleId) || null,
      daysRemaining: r.nextChangeDate ? getDaysDiff(r.nextChangeDate) : null
    }));
    // Sort latest date first
    enriched.sort((a, b) => new Date(b.changeDate) - new Date(a.changeDate));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/oil-changes', (req, res) => {
  try {
    const record = db.createOilChange(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/oil-changes/:id', (req, res) => {
  try {
    const updated = db.updateOilChange(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/oil-changes/:id', (req, res) => {
  try {
    db.deleteOilChange(req.params.id);
    res.json({ success: true, message: 'Deleted oil change record' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// MAINTENANCES API
// -------------------------------------------------------------
app.get('/api/maintenances', (req, res) => {
  try {
    const records = db.getMaintenances(req.query.vehicleId);
    const vehicles = new Map(db.getVehicles().map(v => [v.id, v]));
    const enriched = records.map(r => ({
      ...r,
      vehicle: vehicles.get(r.vehicleId) || null
    }));
    // Sort latest date first
    enriched.sort((a, b) => new Date(b.repairDate) - new Date(a.repairDate));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/maintenances', (req, res) => {
  try {
    const record = db.createMaintenance(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/maintenances/:id', (req, res) => {
  try {
    const updated = db.updateMaintenance(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/maintenances/:id', (req, res) => {
  try {
    db.deleteMaintenance(req.params.id);
    res.json({ success: true, message: 'Deleted maintenance record' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// LINE SETTINGS & LOGS API
// -------------------------------------------------------------
app.get('/api/line/settings', (req, res) => {
  try {
    const settings = db.getLineSettings();
    // Mask token slightly for privacy if set
    const maskedSettings = {
      ...settings,
      hasToken: Boolean(settings.channelAccessToken && settings.channelAccessToken.length > 5)
    };
    res.json({ success: true, data: maskedSettings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/line/settings', (req, res) => {
  try {
    const updated = db.updateLineSettings(req.body);
    initScheduler(); // re-init scheduler with new time if changed
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/line/logs', (req, res) => {
  try {
    const logs = db.getLineLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/line/test', async (req, res) => {
  try {
    const testMsg = `🔔 [ทดสอบระบบ] การเชื่อมต่อ LINE สำเร็จ!\nระบบจัดการข้อมูลรถ “โชคดีค้าข้าว” พร้อมส่งแจ้งเตือนวันครบกำหนดเรียบร้อยแล้ว\nเวลาทดสอบ: ${new Date().toLocaleTimeString('th-TH')}`;
    const result = await sendLineMessage(testMsg);

    const logEntry = db.createLineLog({
      type: 'test',
      vehiclePlate: 'ระบบทดสอบ',
      details: 'ทดสอบส่งข้อความแจ้งเตือนผ่าน LINE Settings',
      status: result.success || result.simulated ? 'sent' : 'failed',
      errorMessage: result.error || (result.simulated ? 'จำลองการส่ง (ยังไม่ได้ใส่ Token)' : null),
      stage: 'test'
    });

    res.json({
      success: true,
      result: result,
      log: logEntry
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/line/webhook', async (req, res) => {
  try {
    const events = req.body?.events || [];
    for (const event of events) {
      const groupId = event?.source?.groupId;
      const userId = event?.source?.userId;
      const replyToken = event?.replyToken;

      console.log(`[LINE Webhook] Event: ${event.type}, GroupId: ${groupId}, UserId: ${userId}`);

      if (groupId) {
        const currentSettings = db.getLineSettings();
        if (!currentSettings.userIdOrGroupId) {
          db.updateLineSettings({ userIdOrGroupId: groupId });
        }
      }

      if (replyToken) {
        const token = db.getLineSettings().channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
        if (token) {
          const replyText = groupId
            ? `🚗 สวัสดีครับ! บอทระบบรถโชคดีค้าข้าวเชื่อมต่อกับกลุ่มนี้แล้ว\n🔑 Group ID: ${groupId}`
            : `🚗 สวัสดีครับ! User ID ของคุณคือ: ${userId}`;

          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              replyToken,
              messages: [{ type: 'text', text: replyText }]
            })
          }).catch(console.error);
        }
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('LINE Webhook Error:', error.message);
    res.status(200).send('OK');
  }
});

app.post('/api/line/scan-and-notify', async (req, res) => {
  try {
    const forceAll = req.body?.force === true;
    const scanResult = await runFleetAlertScanner(forceAll);
    res.json({ success: true, data: scanResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/line/retry-log/:id', async (req, res) => {
  try {
    const logs = db.getLineLogs();
    const log = logs.find(l => l.id === req.params.id);
    if (!log) return res.status(404).json({ success: false, error: 'Log not found' });

    const retryMsg = `🔁 [ส่งซ้ำ] แจ้งเตือนระบบรถโชคดีค้าข้าว\nรายการ: ${log.details}\nรถ: ${log.vehiclePlate}`;
    const result = await sendLineMessage(retryMsg);

    const updated = db.updateLineLog(log.id, {
      status: result.success || result.simulated ? 'sent' : 'failed',
      errorMessage: result.error || (result.simulated ? 'จำลองการส่ง (ยังไม่ใส่ Token)' : null),
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, data: updated, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// REPORTS API
// -------------------------------------------------------------
app.get('/api/reports/fleet', (req, res) => {
  try {
    const vehicles = db.getVehicles();
    const insuranceDocs = db.getInsuranceDocs();
    const prbDocs = db.getPrbDocs();
    const taxDocs = db.getTaxDocs();
    const oilChanges = db.getOilChanges();

    const report = vehicles.map(v => {
      const ins = insuranceDocs.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
      const prb = prbDocs.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.endDate) - new Date(a.endDate))[0];
      const tax = taxDocs.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.expireDate) - new Date(a.expireDate))[0];
      const oil = oilChanges.filter(d => d.vehicleId === v.id).sort((a, b) => new Date(b.changeDate) - new Date(a.changeDate))[0];

      return {
        id: v.id,
        code: v.code,
        name: v.name,
        brand: v.brand,
        model: v.model,
        plateNumber: v.plateNumber,
        province: v.province,
        status: v.status,
        insurance: ins ? { company: ins.company, endDate: ins.endDate, days: getDaysDiff(ins.endDate) } : null,
        prb: prb ? { prbNumber: prb.prbNumber, endDate: prb.endDate, days: getDaysDiff(prb.endDate) } : null,
        tax: tax ? { expireDate: tax.expireDate, days: getDaysDiff(tax.expireDate) } : null,
        oil: oil ? { lastChangeDate: oil.changeDate, nextChangeDate: oil.nextChangeDate, nextMileage: oil.nextMileage } : null
      };
    });

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset data to default seed
app.post('/api/reset-data', (req, res) => {
  try {
    const seed = db.resetToSeed();
    res.json({ success: true, message: 'Reset data to seed successfully', data: seed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static frontend build if available
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), err => {
    if (err) next();
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Server] โชคดีค้าข้าว API Server is running on http://localhost:${PORT}`);
  initScheduler();
});

