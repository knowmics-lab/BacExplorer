// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log('Preload script loaded successfully!');
import { contextBridge, ipcRenderer } from 'electron';

// dockerImage = "";

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
        console.log("Navighiamo dal preload con la pagina:", page);
        if (typeof page === 'string') {
            ipcRenderer.invoke('navigate', page); // Invia solo stringhe
        } else {
            console.error("Valore di 'page' non valido:", page);
        }
    },
    prepareSnakemake: (userInput) => ipcRenderer.send('run-snakemake', userInput),
    launchAnalysis: () => ipcRenderer.invoke('launch-analysis'),
    onSnakemakeOutput: (callback) => {
        console.log('Setting up Snakemake output listener in preload...');
        ipcRenderer.on('snakemake-output', (event, data) => {
            console.error('Received data in preload:', data);
        });

        ipcRenderer.on('setting-error', (event, data) => {
            console.error('Error in preparation: ', data.stderr);
            callback({ isError: true, errorCode: data.code, stderr: data.stderr });
        })
    },
    saveConfigFile: (yamlData) => ipcRenderer.invoke('save-file', yamlData),
    checkDockerInstalled: () => ipcRenderer.invoke('docker-installed'),
    pullImage: () => ipcRenderer.invoke('check-image'),
    createEnv: () => ipcRenderer.invoke('create-container'),
    openExternalLink: () => ipcRenderer.invoke('open-external')
});
