import cron from 'node-cron';
import { runFleetAlertScanner } from './lineNotifier.js';
import { db } from './database.js';

let scheduledTask = null;

export function initScheduler() {
  const settings = db.getLineSettings();
  const notifyTime = settings.notifyTime || '08:00';
  const [hour, minute] = notifyTime.split(':');

  // Cancel previous task if any
  if (scheduledTask) {
    scheduledTask.stop();
  }

  // Cron format: minute hour * * *
  const cronExp = `${parseInt(minute, 10) || 0} ${parseInt(hour, 10) || 8} * * *`;

  console.log(`[Scheduler] Daily Fleet Alert Scanner scheduled at ${notifyTime} (${cronExp})`);

  scheduledTask = cron.schedule(cronExp, async () => {
    console.log(`[Scheduler] Running automated daily fleet alert scan at ${new Date().toISOString()}...`);
    try {
      const result = await runFleetAlertScanner(false);
      console.log(`[Scheduler] Completed scan. Sent: ${result.sent}, Skipped: ${result.skipped}`);
    } catch (err) {
      console.error('[Scheduler] Error during daily scan:', err);
    }
  });
}
