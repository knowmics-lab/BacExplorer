// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log('Preload script loaded successfully!');
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    on: (channel, callback) => {
        const validChannels = ['progress', 'error', 'navigate'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, data) => callback(data));
            // console.log("From preload: Progress...", data.progress);
        }
    },
    off: (channel, callback) => {
        const validChannels = ['navigate'];
        if (validChannels.includes(channel)) {
            ipcRenderer.removeListener(channel, callback);
        }
    },
    removeAllListeners: () => {
    ipcRenderer.removeAllListeners();
    },
    openErrorDialog: () => ipcRenderer.send("open-error-dialog"),
    selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
    onNavigate: (page) => {
        if (typeof page === 'string') {
            ipcRenderer.invoke('navigate', page);
        } else {
            console.error("Valore di 'page' non valido:", page);
        }
    },
    prepareSnakemake: async (userInput) => ipcRenderer.invoke('run-snakemake', userInput),
    launchAnalysis: async () => ipcRenderer.send('launch-analysis'),
    onSnakemakeOutput: (callback) => {
        ipcRenderer.on('snakemake-output', (event, data) => {
            console.error('Received data in preload:', data);
            if(data.stdout) {
                callback({ stdout: data.stdout, stderr: null });
            } else if (data.stderr) {
                callback({ stdout: null, stderr: data.stderr });
            }
            
        });

        ipcRenderer.on('setting-error', (event, data) => {
            console.error('Error in preparation: ', data.stderr);
            callback({ isError: true, errorCode: data.code, stderr: data.stderr });
        })
    },
    launchReport: async () => ipcRenderer.send('launch-report'),
    onReportOutput: (callback) => {
        console.log("Setting up report listener in preload...");
        ipcRenderer.on('report-output', (event, data) => {
            console.error('Received in preload: ', data);
            if(data.stdout) {
                callback({ stdout: data.stdout, stderr: null });
            } else if (data.stderr) {
                callback({ stdout: null, stderr: data.stderr });
            }
        });
    },
    validateInputFolder: async (inputFolder, type) => {const response = await ipcRenderer.invoke('validate-folder', inputFolder, type);
        console.log("From preload: ", response);
        return response;
    },
    saveConfigFile: async (yamlData) => {
        const response = await ipcRenderer.invoke('save-file', yamlData);
        return response;
    },
    checkDockerInstalled: () => ipcRenderer.invoke('docker-installed'),
    pullImage: () => ipcRenderer.invoke('check-image'),
    createEnv: () => ipcRenderer.invoke('create-container'),
    openExternalLink: () => ipcRenderer.invoke('open-external'),
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
    createTempHtmlFile: (htmlContent) => ipcRenderer.invoke("createTempHtmlFile", htmlContent),
});
