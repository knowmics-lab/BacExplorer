import cron from 'node-cron';
import store from './dbUpdateStore.js';
import { runUpdateScript, ALL_DBS } from './dbUpdater.js';

function isDue(db) {
  const last = store.get(`lastUpdate.${db}`, 0);
  const days = store.get('intervalDays', 30);
  return Date.now() - last > days * 24 * 60 * 60 * 1000;
}

async function runUpdates(win, forceDbs = null) {
  // forceDbs permette di forzare db specifici dalla GUI
  const targets = forceDbs ?? ALL_DBS.filter(isDue);
  if (targets.length === 0) {
    console.log('[DB Scheduler] All databases are up to date.');
    return;
  }

  console.log('[DB Scheduler] Updating:', targets);
  // Un'unica chiamata allo script con tutti i db da aggiornare
  await runUpdateScript(win, targets);
}

function startScheduler(win) {
  if (store.get('updateOnStartup')) {
    // Delay per attendere che il renderer sia pronto a ricevere IPC
    setTimeout(() => runUpdates(win), 3000);
  }

  cron.schedule('0 0 * * *', () => {
    if (store.get('autoUpdate')) runUpdates(win);
  });
}

export { startScheduler, runUpdates };