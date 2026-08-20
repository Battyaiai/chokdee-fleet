import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialSeedData } from './seedData.js';
import { cloudSync } from './cloudSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    saveDB(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, restoring seed data:', err);
    saveDB(initialSeedData);
    return JSON.parse(JSON.stringify(initialSeedData));
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    // Automatically trigger cloud auto-sync to GitHub/Cloud on every save/edit
    cloudSync.triggerAutoSync();
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

export const db = {
  // Vehicles
  getVehicles() {
    const data = loadDB();
    return data.vehicles || [];
  },
  getVehicleById(id) {
    const data = loadDB();
    return (data.vehicles || []).find(v => v.id === id);
  },
  createVehicle(vehicle) {
    const data = loadDB();
    const newVehicle = {
      id: vehicle.id || `veh-${Date.now()}`,
      code: vehicle.code || `CK-${String((data.vehicles?.length || 0) + 1).padStart(2, '0')}`,
      name: vehicle.name || '',
      type: vehicle.type || 'รถกระบะ',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      color: vehicle.color || '',
      plateNumber: vehicle.plateNumber || '',
      province: vehicle.province || 'กรุงเทพมหานคร',
      year: vehicle.year || new Date().getFullYear().toString(),
      vin: vehicle.vin || '',
      engineNo: vehicle.engineNo || '',
      status: vehicle.status || 'active',
      notes: vehicle.notes || '',
      createdBy: vehicle.createdBy || 'ผู้ดูแลระบบ',
      createdAt: vehicle.createdAt || new Date().toISOString()
    };
    data.vehicles = [newVehicle, ...(data.vehicles || [])];
    saveDB(data);
    return newVehicle;
  },
  updateVehicle(id, updates) {
    const data = loadDB();
    const index = (data.vehicles || []).findIndex(v => v.id === id);
    if (index === -1) return null;
    data.vehicles[index] = { ...data.vehicles[index], ...updates, updatedAt: new Date().toISOString() };
    saveDB(data);
    return data.vehicles[index];
  },
  deleteVehicle(id) {
    const data = loadDB();
    data.vehicles = (data.vehicles || []).filter(v => v.id !== id);
    // Also clean up related records if needed or keep them
    data.insurance_docs = (data.insurance_docs || []).filter(d => d.vehicleId !== id);
    data.prb_docs = (data.prb_docs || []).filter(d => d.vehicleId !== id);
    data.tax_docs = (data.tax_docs || []).filter(d => d.vehicleId !== id);
    data.oil_changes = (data.oil_changes || []).filter(d => d.vehicleId !== id);
    data.maintenances = (data.maintenances || []).filter(d => d.vehicleId !== id);
    saveDB(data);
    return true;
  },

  // Insurance Docs
  getInsuranceDocs(vehicleId) {
    const data = loadDB();
    let docs = data.insurance_docs || [];
    if (vehicleId) docs = docs.filter(d => d.vehicleId === vehicleId);
    return docs;
  },
  createInsuranceDoc(doc) {
    const data = loadDB();
    const newDoc = {
      id: doc.id || `ins-${Date.now()}`,
      vehicleId: doc.vehicleId,
      company: doc.company || '',
      policyNumber: doc.policyNumber || '',
      startDate: doc.startDate || '',
      endDate: doc.endDate || '',
      premiumAmount: Number(doc.premiumAmount) || 0,
      notes: doc.notes || '',
      createdBy: doc.createdBy || 'ผู้ดูแลระบบ',
      createdAt: doc.createdAt || new Date().toISOString()
    };
    data.insurance_docs = [newDoc, ...(data.insurance_docs || [])];
    saveDB(data);
    return newDoc;
  },
  updateInsuranceDoc(id, updates) {
    const data = loadDB();
    const index = (data.insurance_docs || []).findIndex(d => d.id === id);
    if (index === -1) return null;
    data.insurance_docs[index] = { ...data.insurance_docs[index], ...updates, premiumAmount: Number(updates.premiumAmount ?? data.insurance_docs[index].premiumAmount) || 0 };
    saveDB(data);
    return data.insurance_docs[index];
  },
  deleteInsuranceDoc(id) {
    const data = loadDB();
    data.insurance_docs = (data.insurance_docs || []).filter(d => d.id !== id);
    saveDB(data);
    return true;
  },

  // PRB Docs
  getPrbDocs(vehicleId) {
    const data = loadDB();
    let docs = data.prb_docs || [];
    if (vehicleId) docs = docs.filter(d => d.vehicleId === vehicleId);
    return docs;
  },
  createPrbDoc(doc) {
    const data = loadDB();
    const newDoc = {
      id: doc.id || `prb-${Date.now()}`,
      vehicleId: doc.vehicleId,
      prbNumber: doc.prbNumber || '',
      startDate: doc.startDate || '',
      endDate: doc.endDate || '',
      cost: Number(doc.cost) || 0,
      notes: doc.notes || '',
      createdBy: doc.createdBy || 'ผู้ดูแลระบบ',
      createdAt: doc.createdAt || new Date().toISOString()
    };
    data.prb_docs = [newDoc, ...(data.prb_docs || [])];
    saveDB(data);
    return newDoc;
  },
  updatePrbDoc(id, updates) {
    const data = loadDB();
    const index = (data.prb_docs || []).findIndex(d => d.id === id);
    if (index === -1) return null;
    data.prb_docs[index] = { ...data.prb_docs[index], ...updates, cost: Number(updates.cost ?? data.prb_docs[index].cost) || 0 };
    saveDB(data);
    return data.prb_docs[index];
  },
  deletePrbDoc(id) {
    const data = loadDB();
    data.prb_docs = (data.prb_docs || []).filter(d => d.id !== id);
    saveDB(data);
    return true;
  },

  // Tax Docs
  getTaxDocs(vehicleId) {
    const data = loadDB();
    let docs = data.tax_docs || [];
    if (vehicleId) docs = docs.filter(d => d.vehicleId === vehicleId);
    return docs;
  },
  createTaxDoc(doc) {
    const data = loadDB();
    const newDoc = {
      id: doc.id || `tax-${Date.now()}`,
      vehicleId: doc.vehicleId,
      plateNumber: doc.plateNumber || '',
      province: doc.province || '',
      lastRenewalDate: doc.lastRenewalDate || '',
      expireDate: doc.expireDate || '',
      cost: Number(doc.cost) || 0,
      notes: doc.notes || '',
      createdBy: doc.createdBy || 'ผู้ดูแลระบบ',
      createdAt: doc.createdAt || new Date().toISOString()
    };
    data.tax_docs = [newDoc, ...(data.tax_docs || [])];
    saveDB(data);
    return newDoc;
  },
  updateTaxDoc(id, updates) {
    const data = loadDB();
    const index = (data.tax_docs || []).findIndex(d => d.id === id);
    if (index === -1) return null;
    data.tax_docs[index] = { ...data.tax_docs[index], ...updates, cost: Number(updates.cost ?? data.tax_docs[index].cost) || 0 };
    saveDB(data);
    return data.tax_docs[index];
  },
  deleteTaxDoc(id) {
    const data = loadDB();
    data.tax_docs = (data.tax_docs || []).filter(d => d.id !== id);
    saveDB(data);
    return true;
  },

  // Oil Changes
  getOilChanges(vehicleId) {
    const data = loadDB();
    let records = data.oil_changes || [];
    if (vehicleId) records = records.filter(d => d.vehicleId === vehicleId);
    return records;
  },
  createOilChange(record) {
    const data = loadDB();
    const newRecord = {
      id: record.id || `oil-${Date.now()}`,
      vehicleId: record.vehicleId,
      changeDate: record.changeDate || new Date().toISOString().split('T')[0],
      currentMileage: Number(record.currentMileage) || 0,
      oilDetails: record.oilDetails || '',
      cost: Number(record.cost) || 0,
      nextChangeDate: record.nextChangeDate || '',
      nextMileage: Number(record.nextMileage) || 0,
      notes: record.notes || '',
      createdBy: record.createdBy || 'ผู้ดูแลระบบ',
      createdAt: record.createdAt || new Date().toISOString()
    };
    data.oil_changes = [newRecord, ...(data.oil_changes || [])];
    saveDB(data);
    return newRecord;
  },
  updateOilChange(id, updates) {
    const data = loadDB();
    const index = (data.oil_changes || []).findIndex(d => d.id === id);
    if (index === -1) return null;
    data.oil_changes[index] = {
      ...data.oil_changes[index],
      ...updates,
      currentMileage: Number(updates.currentMileage ?? data.oil_changes[index].currentMileage) || 0,
      nextMileage: Number(updates.nextMileage ?? data.oil_changes[index].nextMileage) || 0,
      cost: Number(updates.cost ?? data.oil_changes[index].cost) || 0
    };
    saveDB(data);
    return data.oil_changes[index];
  },
  deleteOilChange(id) {
    const data = loadDB();
    data.oil_changes = (data.oil_changes || []).filter(d => d.id !== id);
    saveDB(data);
    return true;
  },

  // Maintenances
  getMaintenances(vehicleId) {
    const data = loadDB();
    let records = data.maintenances || [];
    if (vehicleId) records = records.filter(d => d.vehicleId === vehicleId);
    return records;
  },
  createMaintenance(record) {
    const data = loadDB();
    const newRecord = {
      id: record.id || `mnt-${Date.now()}`,
      vehicleId: record.vehicleId,
      repairDate: record.repairDate || new Date().toISOString().split('T')[0],
      mileage: Number(record.mileage) || 0,
      description: record.description || '',
      garage: record.garage || '',
      cost: Number(record.cost) || 0,
      notes: record.notes || '',
      createdBy: record.createdBy || 'ผู้ดูแลระบบ',
      createdAt: record.createdAt || new Date().toISOString()
    };
    data.maintenances = [newRecord, ...(data.maintenances || [])];
    saveDB(data);
    return newRecord;
  },
  updateMaintenance(id, updates) {
    const data = loadDB();
    const index = (data.maintenances || []).findIndex(d => d.id === id);
    if (index === -1) return null;
    data.maintenances[index] = {
      ...data.maintenances[index],
      ...updates,
      mileage: Number(updates.mileage ?? data.maintenances[index].mileage) || 0,
      cost: Number(updates.cost ?? data.maintenances[index].cost) || 0
    };
    saveDB(data);
    return data.maintenances[index];
  },
  deleteMaintenance(id) {
    const data = loadDB();
    data.maintenances = (data.maintenances || []).filter(d => d.id !== id);
    saveDB(data);
    return true;
  },

  // LINE Settings
  getLineSettings() {
    const data = loadDB();
    return data.line_settings || initialSeedData.line_settings;
  },
  updateLineSettings(updates) {
    const data = loadDB();
    data.line_settings = { ...(data.line_settings || initialSeedData.line_settings), ...updates };
    saveDB(data);
    return data.line_settings;
  },

  // Admin PIN Auth
  getAdminPin() {
    const data = loadDB();
    return data.adminPin || '172839';
  },
  setAdminPin(newPin) {
    const data = loadDB();
    data.adminPin = newPin;
    saveDB(data);
    return true;
  },

  // LINE Logs
  getLineLogs() {
    const data = loadDB();
    return data.line_logs || [];
  },
  createLineLog(log) {
    const data = loadDB();
    const newLog = {
      id: log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: log.timestamp || new Date().toISOString(),
      type: log.type || 'system',
      vehiclePlate: log.vehiclePlate || '-',
      details: log.details || '',
      status: log.status || 'sent',
      errorMessage: log.errorMessage || null,
      stage: log.stage || ''
    };
    data.line_logs = [newLog, ...(data.line_logs || [])];
    // Keep max 200 logs
    if (data.line_logs.length > 200) {
      data.line_logs = data.line_logs.slice(0, 200);
    }
    saveDB(data);
    return newLog;
  },
  updateLineLog(id, updates) {
    const data = loadDB();
    const index = (data.line_logs || []).findIndex(l => l.id === id);
    if (index === -1) return null;
    data.line_logs[index] = { ...data.line_logs[index], ...updates };
    saveDB(data);
    return data.line_logs[index];
  },

  // Duplicate Check: Check if we sent notification for this vehicle + type + stage today
  hasBeenNotifiedToday(type, vehiclePlate, stage) {
    const data = loadDB();
    const today = new Date().toISOString().split('T')[0];
    return (data.line_logs || []).some(log => {
      const logDate = log.timestamp?.split('T')[0];
      return logDate === today &&
        log.status === 'sent' &&
        log.type === type &&
        log.vehiclePlate === vehiclePlate &&
        log.stage === stage;
    });
  },

  // Staff Members (ผู้บันทึกข้อมูล)
  getStaffMembers() {
    const data = loadDB();
    if (!data.staff_members || data.staff_members.length === 0) {
      data.staff_members = [
        { id: "staff-1", name: "พัควลัญชญ์ อุไรล้ำ", role: "พนักงานไอที", isDefault: true, createdAt: new Date().toISOString() },
        { id: "staff-2", name: "สมศักดิ์ ข้าวดี", role: "หัวหน้าคลัง", isDefault: false, createdAt: new Date().toISOString() },
        { id: "staff-3", name: "มานะ ขยันงาน", role: "ธุรการ", isDefault: false, createdAt: new Date().toISOString() },
        { id: "staff-4", name: "สมคิด", role: "ช่างประจำร้าน", isDefault: false, createdAt: new Date().toISOString() }
      ];
      saveDB(data);
    }
    return data.staff_members;
  },
  createStaffMember(staff) {
    const data = loadDB();
    const members = data.staff_members || [];
    if (staff.isDefault) {
      members.forEach(m => { m.isDefault = false; });
    }
    const newStaff = {
      id: staff.id || `staff-${Date.now()}`,
      name: (staff.name || '').trim(),
      role: (staff.role || '').trim(),
      isDefault: Boolean(staff.isDefault) || members.length === 0,
      createdAt: new Date().toISOString()
    };
    data.staff_members = [...members, newStaff];
    saveDB(data);
    return newStaff;
  },
  updateStaffMember(id, updates) {
    const data = loadDB();
    const members = data.staff_members || [];
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;
    if (updates.isDefault) {
      members.forEach(m => { m.isDefault = false; });
    }
    data.staff_members[index] = {
      ...members[index],
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : members[index].name,
      role: updates.role !== undefined ? updates.role.trim() : members[index].role,
      updatedAt: new Date().toISOString()
    };
    saveDB(data);
    return data.staff_members[index];
  },
  deleteStaffMember(id) {
    const data = loadDB();
    data.staff_members = (data.staff_members || []).filter(m => m.id !== id);
    if (data.staff_members.length > 0 && !data.staff_members.some(m => m.isDefault)) {
      data.staff_members[0].isDefault = true;
    }
    saveDB(data);
    return true;
  },
  setDefaultStaffMember(id) {
    const data = loadDB();
    const members = data.staff_members || [];
    members.forEach(m => {
      m.isDefault = (m.id === id);
    });
    data.staff_members = members;
    saveDB(data);
    return members;
  },

  // Reset to seed data
  resetToSeed() {
    saveDB(initialSeedData);
    return initialSeedData;
  }
};
