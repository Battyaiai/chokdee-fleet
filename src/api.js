const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),

  // Vehicles
  getVehicles: () => request('/vehicles'),
  getVehicle: (id) => request(`/vehicles/${id}`),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  bulkCreateVehicles: (data) => request('/vehicles/bulk', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Insurance Docs
  getInsurance: (vehicleId) => request(`/insurance${vehicleId ? `?vehicleId=${vehicleId}` : ''}`),
  createInsurance: (data) => request('/insurance', { method: 'POST', body: JSON.stringify(data) }),
  updateInsurance: (id, data) => request(`/insurance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInsurance: (id) => request(`/insurance/${id}`, { method: 'DELETE' }),

  // PRB Docs
  getPrb: (vehicleId) => request(`/prb${vehicleId ? `?vehicleId=${vehicleId}` : ''}`),
  createPrb: (data) => request('/prb', { method: 'POST', body: JSON.stringify(data) }),
  updatePrb: (id, data) => request(`/prb/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePrb: (id) => request(`/prb/${id}`, { method: 'DELETE' }),

  // Tax Docs
  getTax: (vehicleId) => request(`/tax${vehicleId ? `?vehicleId=${vehicleId}` : ''}`),
  createTax: (data) => request('/tax', { method: 'POST', body: JSON.stringify(data) }),
  updateTax: (id, data) => request(`/tax/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTax: (id) => request(`/tax/${id}`, { method: 'DELETE' }),

  // Oil Changes
  getOilChanges: (vehicleId) => request(`/oil-changes${vehicleId ? `?vehicleId=${vehicleId}` : ''}`),
  createOilChange: (data) => request('/oil-changes', { method: 'POST', body: JSON.stringify(data) }),
  updateOilChange: (id, data) => request(`/oil-changes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOilChange: (id) => request(`/oil-changes/${id}`, { method: 'DELETE' }),

  // Maintenances
  getMaintenances: (vehicleId) => request(`/maintenances${vehicleId ? `?vehicleId=${vehicleId}` : ''}`),
  createMaintenance: (data) => request('/maintenances', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenance: (id, data) => request(`/maintenances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaintenance: (id) => request(`/maintenances/${id}`, { method: 'DELETE' }),

  // LINE Integration
  getLineSettings: () => request('/line/settings'),
  updateLineSettings: (data) => request('/line/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getLineLogs: () => request('/line/logs'),
  testLine: () => request('/line/test', { method: 'POST' }),
  scanAndNotifyLine: (force = false) => request('/line/scan-and-notify', { method: 'POST', body: JSON.stringify({ force }) }),
  retryLineLog: (id) => request(`/line/retry-log/${id}`, { method: 'POST' }),

  // Reports
  getFleetReport: () => request('/reports/fleet'),
  resetSeedData: () => request('/reset-data', { method: 'POST' }),

  // Admin Auth
  adminLogin: (pin) => request('/admin/login', { method: 'POST', body: JSON.stringify({ pin }) }),
  adminChangePin: (oldPin, newPin) => request('/admin/change-pin', { method: 'PUT', body: JSON.stringify({ oldPin, newPin }) }),

  // Cloud Sync
  getCloudSyncStatus: () => request('/cloud-sync/status'),
  triggerCloudSync: (data) => request('/cloud-sync/sync-now', { method: 'POST', body: JSON.stringify(data || {}) })
};
