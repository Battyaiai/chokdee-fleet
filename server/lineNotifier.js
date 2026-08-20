import { db } from './database.js';

// Calculate days remaining between today and target date
export function getDaysDiff(targetDateStr) {
  if (!targetDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate months remaining
export function getMonthsDiff(targetDateStr) {
  if (!targetDateStr) return null;
  const today = new Date();
  const target = new Date(targetDateStr);
  let months = (target.getFullYear() - today.getFullYear()) * 12;
  months += target.getMonth() - today.getMonth();
  return months;
}

// Format Thai Date e.g. 20/09/2569 or 20/09/2026
export function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Determine stage for alerts
export function getAlertStage(daysRemaining) {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining === 0) return 'today';
  if (daysRemaining <= 7) return '7days';
  if (daysRemaining <= 30) return '1month';
  if (daysRemaining <= 60) return '2months';
  if (daysRemaining <= 90) return '3months';
  return 'normal';
}

// Send message via LINE Messaging API
export async function sendLineMessage(text, altText = 'แจ้งเตือนระบบรถโชคดีค้าข้าว') {
  const settings = db.getLineSettings();
  const token = (settings.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();
  const targetId = (settings.userIdOrGroupId || process.env.LINE_USER_ID || '').trim();

  if (!token) {
    return {
      success: false,
      simulated: true,
      message: 'ยังไม่ได้ระบุ Channel Access Token (ระบบจำลองการทำงานบนเครื่อง)'
    };
  }

  if (!targetId) {
    return {
      success: false,
      error: 'กรุณาระบุ User ID หรือ Group ID (เช่น U... หรือ C...) ในหน้าตั้งค่า'
    };
  }

  // Validate User ID / Group ID format
  if (!targetId.startsWith('U') && !targetId.startsWith('C') && !targetId.startsWith('R')) {
    return {
      success: false,
      error: `รูปแบบ User ID / Group ID ไม่ถูกต้อง (${targetId}) ต้องขึ้นต้นด้วยตัว U (เช่น U123...) หรือตัว C (เช่น C123...) ความยาว 33 ตัวอักษร (อย่าใส่ Channel Secret)`
    };
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: targetId,
        messages: [
          {
            type: 'text',
            text: text
          }
        ]
      })
    });

    if (response.ok) {
      return { success: true, message: 'ส่งข้อความ LINE สำเร็จเรียบร้อยแล้ว' };
    }

    const errData = await response.json().catch(() => ({ message: response.statusText }));
    let errorDetail = errData.message || response.statusText;
    
    if (response.status === 400) {
      if (errorDetail.includes('property, \'to\'')) {
        errorDetail = 'User ID หรือ Group ID ไม่ถูกต้อง หรือไม่มีอยู่ในระบบ (ตรวจสอบว่าขึ้นต้นด้วย U หรือ C และยาว 33 ตัวอักษร)';
      }
    } else if (response.status === 401) {
      errorDetail = 'Channel Access Token ไม่ถูกต้องหรือหมดอายุ (กรุณากด Issue Token ใหม่จาก LINE Developers)';
    } else if (response.status === 403) {
      errorDetail = 'บอทถูกบล็อกหรือไม่สามารถส่งหาผู้ใช้นี้ได้ (กรุณาสแกน QR Code เพิ่มเพื่อนกับบอทก่อน)';
    }

    return { 
      success: false, 
      error: `LINE API (${response.status}): ${errorDetail}` 
    };
  } catch (error) {
    console.error('LINE Send Error:', error.message, error.cause);
    const detail = error.cause?.message || error.message;
    return { success: false, error: `ไม่สามารถเชื่อมต่อ LINE เซิร์ฟเวอร์ได้: ${detail}` };
  }
}


// Check and send all pending notifications (Daily Scanner)
export async function runFleetAlertScanner(forceAll = false) {
  const settings = db.getLineSettings();
  if (!settings.isEnabled && !forceAll) {
    return { processed: 0, sent: 0, skipped: 0, reason: 'LINE Notification is disabled' };
  }

  const vehicles = db.getVehicles().filter(v => v.status === 'active');
  const insuranceDocs = db.getInsuranceDocs();
  const prbDocs = db.getPrbDocs();
  const taxDocs = db.getTaxDocs();
  const oilChanges = db.getOilChanges();

  let sentCount = 0;
  let skippedCount = 0;
  const results = [];

  for (const vehicle of vehicles) {
    const plateStr = `${vehicle.plateNumber} ${vehicle.province}`;

    // 1. Check Insurance
    if (settings.notifyInsurance) {
      const insList = insuranceDocs.filter(d => d.vehicleId === vehicle.id);
      for (const ins of insList) {
        if (!ins.endDate) continue;
        const days = getDaysDiff(ins.endDate);
        const stage = getAlertStage(days);

        // Notify if within 60 days (or configured days) or expired
        const shouldNotify = days <= (settings.daysInsuranceBefore || 60);
        if (shouldNotify) {
          const alreadyNotified = !forceAll && db.hasBeenNotifiedToday('insurance', plateStr, stage);
          if (!alreadyNotified) {
            let msg = `🚗 แจ้งเตือนประกันรถ - โชคดีค้าข้าว\n`;
            msg += `รถ: ${vehicle.brand} ${vehicle.model} (${vehicle.name})\n`;
            msg += `ทะเบียน: ${plateStr}\n`;
            msg += `บริษัท: ${ins.company || '-'}\n`;
            msg += `ประกันจะหมดอายุวันที่: ${formatThaiDate(ins.endDate)}\n`;
            if (days < 0) {
              msg += `สถานะ: 🔴 หมดอายุแล้ว (${Math.abs(days)} วันที่แล้ว)\n`;
            } else if (days === 0) {
              msg += `สถานะ: 🔴 หมดอายุวันนี้!\n`;
            } else {
              msg += `เหลือเวลา: ⏳ ${days} วัน\n`;
            }
            msg += `\nกรุณาตรวจสอบและดำเนินการต่อประกัน`;

            const res = await sendLineMessage(msg);
            const status = res.success || res.simulated ? 'sent' : 'failed';
            db.createLineLog({
              type: 'insurance',
              vehiclePlate: plateStr,
              details: `ประกัน (${ins.company || 'ประกันภัย'}) หมดอายุ ${formatThaiDate(ins.endDate)} [${days < 0 ? 'หมดอายุแล้ว' : `เหลือ ${days} วัน`}]`,
              status: status,
              errorMessage: res.error || (res.simulated ? 'จำลองการส่ง (ยังไม่ใส่ Token)' : null),
              stage: stage
            });
            sentCount++;
            results.push({ type: 'insurance', vehicle: plateStr, status });
          } else {
            skippedCount++;
          }
        }
      }
    }

    // 2. Check Tax (ทะเบียน)
    if (settings.notifyTax) {
      const taxList = taxDocs.filter(d => d.vehicleId === vehicle.id);
      for (const tax of taxList) {
        if (!tax.expireDate) continue;
        const days = getDaysDiff(tax.expireDate);
        const stage = getAlertStage(days);

        // Notify if within 90 days (or configured days) or expired
        const shouldNotify = days <= (settings.daysTaxBefore || 90);
        if (shouldNotify) {
          const alreadyNotified = !forceAll && db.hasBeenNotifiedToday('tax', plateStr, stage);
          if (!alreadyNotified) {
            let msg = `🚗 แจ้งเตือนต่อทะเบียน - โชคดีค้าข้าว\n`;
            msg += `รถ: ${vehicle.brand} ${vehicle.model} (${vehicle.name})\n`;
            msg += `ทะเบียน: ${plateStr}\n`;
            msg += `ทะเบียนครบกำหนดวันที่: ${formatThaiDate(tax.expireDate)}\n`;
            if (days < 0) {
              msg += `สถานะ: 🔴 เกินกำหนดแล้ว (${Math.abs(days)} วันที่แล้ว)\n`;
            } else if (days === 0) {
              msg += `สถานะ: 🔴 ครบกำหนดวันนี้!\n`;
            } else {
              msg += `เหลือเวลา: ⏳ ${days} วัน\n`;
            }
            msg += `\nกรุณาดำเนินการต่อทะเบียนและตรวจสภาพรถ`;

            const res = await sendLineMessage(msg);
            const status = res.success || res.simulated ? 'sent' : 'failed';
            db.createLineLog({
              type: 'tax',
              vehiclePlate: plateStr,
              details: `ต่อทะเบียน ครบกำหนด ${formatThaiDate(tax.expireDate)} [${days < 0 ? 'เกินกำหนดแล้ว' : `เหลือ ${days} วัน`}]`,
              status: status,
              errorMessage: res.error || (res.simulated ? 'จำลองการส่ง (ยังไม่ใส่ Token)' : null),
              stage: stage
            });
            sentCount++;
            results.push({ type: 'tax', vehicle: plateStr, status });
          } else {
            skippedCount++;
          }
        }
      }
    }

    // 3. Check PRB (พ.ร.บ.)
    if (settings.notifyPrb) {
      const prbList = prbDocs.filter(d => d.vehicleId === vehicle.id);
      for (const prb of prbList) {
        if (!prb.endDate) continue;
        const days = getDaysDiff(prb.endDate);
        const stage = getAlertStage(days);

        // Notify if within 60 days (or configured days) or expired
        const shouldNotify = days <= (settings.daysPrbBefore || 60);
        if (shouldNotify) {
          const alreadyNotified = !forceAll && db.hasBeenNotifiedToday('prb', plateStr, stage);
          if (!alreadyNotified) {
            let msg = `📋 แจ้งเตือน พ.ร.บ. - โชคดีค้าข้าว\n`;
            msg += `รถ: ${vehicle.brand} ${vehicle.model} (${vehicle.name})\n`;
            msg += `ทะเบียน: ${plateStr}\n`;
            msg += `เลข พ.ร.บ.: ${prb.prbNumber || '-'}\n`;
            msg += `พ.ร.บ. จะหมดอายุวันที่: ${formatThaiDate(prb.endDate)}\n`;
            if (days < 0) {
              msg += `สถานะ: 🔴 หมดอายุแล้ว (${Math.abs(days)} วันที่แล้ว)\n`;
            } else if (days === 0) {
              msg += `สถานะ: 🔴 หมดอายุวันนี้!\n`;
            } else {
              msg += `เหลือเวลา: ⏳ ${days} วัน\n`;
            }
            msg += `\nกรุณาตรวจสอบและดำเนินการต่อ พ.ร.บ.`;

            const res = await sendLineMessage(msg);
            const status = res.success || res.simulated ? 'sent' : 'failed';
            db.createLineLog({
              type: 'prb',
              vehiclePlate: plateStr,
              details: `พ.ร.บ. หมดอายุ ${formatThaiDate(prb.endDate)} [${days < 0 ? 'หมดอายุแล้ว' : `เหลือ ${days} วัน`}]`,
              status: status,
              errorMessage: res.error || (res.simulated ? 'จำลองการส่ง (ยังไม่ใส่ Token)' : null),
              stage: stage
            });
            sentCount++;
            results.push({ type: 'prb', vehicle: plateStr, status });
          } else {
            skippedCount++;
          }
        }
      }
    }

    // 4. Check Oil Change Schedule
    if (settings.notifyOil) {
      const oilList = oilChanges.filter(d => d.vehicleId === vehicle.id);
      for (const oil of oilList) {
        if (!oil.nextChangeDate) continue;
        const days = getDaysDiff(oil.nextChangeDate);
        if (days !== null && days <= 14) {
          const stage = getAlertStage(days);
          const alreadyNotified = !forceAll && db.hasBeenNotifiedToday('oil', plateStr, stage);
          if (!alreadyNotified) {
            let msg = `🔧 แจ้งเตือนเปลี่ยนน้ำมันเครื่อง - โชคดีค้าข้าว\n`;
            msg += `รถ: ${vehicle.brand} ${vehicle.model} (${vehicle.name})\n`;
            msg += `ทะเบียน: ${plateStr}\n`;
            msg += `นัดเปลี่ยนน้ำมันเครื่อง: ${formatThaiDate(oil.nextChangeDate)}\n`;
            if (oil.nextMileage) {
              msg += `เลขไมล์เป้าหมาย: ${oil.nextMileage.toLocaleString()} กม.\n`;
            }
            msg += `\nกรุณาตรวจสอบรถก่อนถึงกำหนด`;

            const res = await sendLineMessage(msg);
            const status = res.success || res.simulated ? 'sent' : 'failed';
            db.createLineLog({
              type: 'oil',
              vehiclePlate: plateStr,
              details: `นัดเปลี่ยนน้ำมันเครื่อง ${formatThaiDate(oil.nextChangeDate)} (เป้าหมาย ${oil.nextMileage ? oil.nextMileage.toLocaleString() + ' กม.' : '-'})`,
              status: status,
              errorMessage: res.error || (res.simulated ? 'จำลองการส่ง (ยังไม่ใส่ Token)' : null),
              stage: stage
            });
            sentCount++;
            results.push({ type: 'oil', vehicle: plateStr, status });
          }
        }
      }
    }
  }

  return {
    processed: vehicles.length,
    sent: sentCount,
    skipped: skippedCount,
    results
  };
}
