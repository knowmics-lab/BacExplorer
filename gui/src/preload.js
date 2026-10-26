// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log('Preload script loaded successfully!');
import { contextBridge, ipcRenderer } from 'electron';

// ── Canali validi per on/off ────────────────────────────────────
const VALID_ON_CHANNELS = [
  'progress',
  'error',
  'navigate',
  // DB updater
  'db-update-start',
  'db-update-log',
  'db-update-done',
  'db-update-error',
];

const VALID_OFF_CHANNELS = [
  'navigate',
  // DB updater
  'db-update-start',
  'db-update-log',
  'db-update-done',
  'db-update-error',
];

contextBridge.exposeInMainWorld('api', {

  // ── Esistenti (invariati) ─────────────────────────────────────

  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  on: (channel, callback) => {
    if (VALID_ON_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, (event, data) => callback(data));
    }
  },
  off: (channel, callback) => {
    if (VALID_OFF_CHANNELS.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners();
  },
  openErrorDialog:    () => ipcRenderer.send('open-error-dialog'),
  selectFolder:       () => ipcRenderer.invoke('dialog:select-folder'),
  navigate: (page) => {
    if (typeof page === 'string') {
      ipcRenderer.invoke('navigate', page);
    } else {
      console.error("Valore di 'page' non valido:", page);
    }
  },
  prepareSnakemake:   async (userInput) => ipcRenderer.invoke('run-snakemake', userInput),
  launchAnalysis:     async () => ipcRenderer.send('launch-analysis'),
  onSnakemakeOutput: (callback) => {
    ipcRenderer.on('snakemake-output', (event, data) => {
      console.error('Received data in preload:', data);
      if (data.stdout) {
        callback({ stdout: data.stdout, stderr: null, isError: false });
      } else if (data.stderr) {
        callback({ stdout: null, stderr: data.stderr, isError: false });
      }
    });
    ipcRenderer.on('snakemake-error', (event, data) => {
      console.error('Received data in preload:', data);
      callback({ ...data, isError: true });
    });
  },
  launchReport:       async () => ipcRenderer.send('launch-report'),
  onReportOutput: (callback) => {
    console.log('Setting up report listener in preload...');
    ipcRenderer.on('report-output', (event, data) => {
      console.error('Received in preload: ', data);
      if (data.stdout) {
        callback({ stdout: data.stdout, stderr: null });
      } else if (data.stderr) {
        callback({ stdout: null, stderr: data.stderr });
      }
    });
    ipcRenderer.on('report-error', (event, data) => {
      console.error('Received in preload: ', data);
      callback({ ...data, isError: true });
    });
  },
  validateInputFolder: async (inputFolder, type) => {
    const response = await ipcRenderer.invoke('validate-folder', inputFolder, type);
    console.log('From preload: ', response);
    return response;
  },
  saveConfigFile:      async (yamlData) => ipcRenderer.invoke('save-file', yamlData),
  checkDockerInstalled: ()              => ipcRenderer.invoke('docker-installed'),
  pullImage:            ()              => ipcRenderer.invoke('check-image'),
  createEnv:            ()              => ipcRenderer.invoke('create-container'),
  openExternalLink:     ()              => ipcRenderer.invoke('open-external'),
  pickReportDir: async () => {
    const dir = await ipcRenderer.invoke('pick-rep-dir');
    console.log(dir);
    return dir;
  },
  readHtmlFile: async (filePath) => {
    const html = await ipcRenderer.invoke('readHTML', filePath);
    console.log(html);
    return html;
  },
  createTempHtmlFile: (htmlContent) => ipcRenderer.invoke('create-temp-html-file', htmlContent),
  openHtmlFile:       (html)         => ipcRenderer.invoke('open-html', html),
  checkContainer:     ()             => ipcRenderer.invoke('check-container'),
  openGenusList:      ()             => ipcRenderer.invoke('get-genus-species'),

  // ── DB Updater ────────────────────────────────────────────────

  // Stato di tutti i DB (lastUpdate, isDue)
  dbGetStatus: () => {
    ipcRenderer.invoke('db-get-status');
    console.log('dbGetStatus called');
  },

  // Aggiornamento manuale; dbs=null → tutti, altrimenti es. ['vfdb','card']
  dbUpdateManual: (dbs = null) => ipcRenderer.invoke('db-update-manual', dbs),

  // Lettura impostazioni scheduler
  dbGetSettings: () => ipcRenderer.invoke('db-get-settings'),

  // Salvataggio impostazioni scheduler
  // settings = { autoUpdate, intervalDays, updateOnStartup, vfdbSet, abricateDb }
  dbSaveSettings: (settings) => ipcRenderer.invoke('db-save-settings', settings),

  // Listener eventi push (streaming log + stato avanzamento)
  // Uso: api.onDbUpdateStart(({ dbs }) => ...)
  onDbUpdateStart: (callback) => {
    ipcRenderer.on('db-update-start', (_, data) => callback(data));
  },
  // Uso: api.onDbUpdateLog(({ line }) => ...)
  onDbUpdateLog: (callback) => {
    ipcRenderer.on('db-update-log', (_, data) => callback(data));
  },
  // Uso: api.onDbUpdateDone(({ results, exitCode }) => ...)
  onDbUpdateDone: (callback) => {
    ipcRenderer.on('db-update-done', (_, data) => callback(data));
  },
  // Uso: api.onDbUpdateError(({ message }) => ...)
  onDbUpdateError: (callback) => {
    ipcRenderer.on('db-update-error', (_, data) => callback(data));
  },

  // Rimozione esplicita dei listener DB (utile nel cleanup dei componenti React)
  offDbUpdate: () => {
    ['db-update-start', 'db-update-log', 'db-update-done', 'db-update-error']
      .forEach(ch => ipcRenderer.removeAllListeners(ch));
  },
});
