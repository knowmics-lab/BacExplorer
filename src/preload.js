// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log('Preload script loaded successfully!');
import { contextBridge, ipcRenderer } from 'electron';

// dockerImage = "";

contextBridge.exposeInMainWorld('api', {
    openErrorDialog: () => ipcRenderer.send("open-error-dialog"),
    selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
    onNavigate: (callback) => ipcRenderer.on('navigate', (event, page) => callback(page)),
    runSnakemake: (userInput) => ipcRenderer.send('run-snakemake', userInput),
    onSnakemakeOutput: (callback) => {
        console.log('Setting up Snakemake output listener in preload...');
        ipcRenderer.on('snakemake-output', (event, data) => {
            console.log('Received data in preload:', data);
            callback(data);
        });
    },
    saveConfigFile: (yamlData) => ipcRenderer.invoke('save-file', yamlData),
    checkDockerInstalled: () => ipcRenderer.invoke('docker-installed'),
    createEnv: () => ipcRenderer.invoke('create-container')
});
