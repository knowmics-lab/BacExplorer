import { spawn } from 'child_process';
import store from './dbUpdateStore.js';
import path from 'path';
import { containerVariables } from '../global_variables.js';

const SCRIPT = containerVariables.containerScripts
  ? path.join(containerVariables.containerScripts, 'update_dbs.sh')
  : '/app/scripts/update_dbs.sh';

// Tutti i database supportati dallo script
const ALL_DBS = ['amrfinder', 'card', 'argannot', 'vfdb', 'megares', 'resfinder'];

function notify(win, channel, payload) {
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, payload);
  }
}

function runUpdateScript(win, dbs = ALL_DBS) {
  return new Promise(async (resolve) => {
    try {
      await checkContainerRunning(containerVariables.containerName);
    } catch (err) {
      notify(win, 'db-update-error', {
        message: `Container not available: ${err.message}`,
      });
      resolve(dbs.map(db => ({ db, status: 'failed' })));
      return;
    }

    const env = {
      ...process.env,
      VFDB_SET: store.get('vfdbSet', 'setA'),
    };

    const abricateDb = store.get('abricateDb', '');
    if (abricateDb) env.ABRICATE_DB = abricateDb;

    notify(win, 'db-update-start', { dbs });

    const proc = spawn('docker', [
      'exec',
      containerVariables.containerName,
      'bash',
      SCRIPT,
      ...dbs,
    ], { env });

    const outputLines = [];

    const onData = (data) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach(line => {
        outputLines.push(line);
        notify(win, 'db-update-log', { line });
      });
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);

    proc.on('close', (code) => {
      const results = parseScriptSummary(outputLines, dbs);

      const now = Date.now();
      results
        .filter(r => r.status === 'ok')
        .forEach(r => store.set(`lastUpdate.${r.db}`, now));

      notify(win, 'db-update-done', { results, exitCode: code });
      resolve(results);
    });

    proc.on('error', (err) => {
      notify(win, 'db-update-error', {
        message: `Impossible to execute script: ${err.message}`,
      });
      resolve(dbs.map(db => ({ db, status: 'failed' })));
    });
  });
}

function parseScriptSummary(lines, requestedDbs) {
  const results = [];
  const summaryStart = lines.findIndex(l => l.includes('SUMMARY'));

  if (summaryStart !== -1) {
    const summaryLines = lines.slice(summaryStart);
    for (const db of requestedDbs) {
      const match = summaryLines.find(l =>
        l.toLowerCase().includes(db.toLowerCase())
      );
      results.push({
        db,
        status: match?.toLowerCase().includes('ok') ? 'ok' : 'failed',
        detail: match?.trim() ?? 'No output',
      });
    }
  } else {
    requestedDbs.forEach(db =>
      results.push({ db, status: 'failed', detail: 'Script interrupted' })
    );
  }

  return results;
}

export { runUpdateScript, ALL_DBS };