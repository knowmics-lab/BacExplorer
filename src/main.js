import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron';
import started from 'electron-squirrel-startup';
import { spawn, execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { checkDockerInstalled, checkDockerRunning } from './utilities/functions.js';
import { setupContainer } from './utilities/container_creation.js';
import { prepareSnakemakeCommand } from './utilities/docker_utils.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    // autoHideMenuBar: true
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  // configure the menu
  const template = [
    {
      label: "Guide",
      click: () => mainWindow.webContents.send('navigate', 'guide')
    },
    {
      label: "Settings",
      click: () => mainWindow.webContents.send('navigate', 'settings')
    },
    {
      label: "Help",
      submenu:
      [
        {
          label: "GitHub",
          click: () => {
            const { shell } = require('electron')
            //sostituire con repo github di bacExplorer
            shell.openExternal('https://electronjs.org');
          }
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  const userDataPath = app.getPath('userData');

  const targetFolder = path.join(userDataPath, 'snakemake');

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
    console.log(`Updating userData. Creating folder: ${targetFolder}`);
  }

  const sourceFolder = path.join(__dirname, 'snakemake');

  try {
    fsExtra.copySync(sourceFolder, targetFolder);
    console.log('Files successfully copied!');
  } catch (err) {
    console.error('Error while copying:', err);
  }

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// ipcMain.on("open-error-dialog", function(){
//   dialog.showErrorBox("An Error Message", "Demo of an error message");
// })

// save config file directly into userData
const configPath = path.join(app.getPath('userData'), "snakemake");
const imageName = "priviteragf/bacexplorer:latest";
const containerName = "snakemakeContainer";

ipcMain.handle('open-external', () => {
  let url = "";
  const platform = os.platform();
    if (platform === "win32") {
      url = "https://docs.docker.com/desktop/setup/install/windows-install/";
    } else if (platform === "darwin") {
      url = "https://docs.docker.com/desktop/setup/install/mac-install/";
    } else if (platform === "linux") {
      url = "https://docs.docker.com/engine/install/ubuntu/";
    }
  console.log("Navigating to: ", url);
  shell.openExternal(url);
})

// docker check
ipcMain.handle("docker-installed", async function() {
  try {
    const docker = await checkDockerInstalled();
    console.log("Docker found: ", docker);
    return docker;
  } catch (error) {
    throw (error);
  }
})

ipcMain.handle("docker-running", async function() {
  try {
    return await checkDockerRunning();
  } catch (error) {
    throw (error);
  }
})

// environment setup
ipcMain.handle('create-container', async function() {
  try {
    const response = await setupContainer(configPath, imageName, containerName);
    console.log("In main.js: ", response);
    return response;
  } catch (error) {
    throw (error);
  }
})

// select input folder
ipcMain.handle("dialog:select-folder", async function(event){
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    });
  
  console.log('filePaths:', filePaths);
  return canceled ? null : filePaths;
})

// launch analysis via snakemake
ipcMain.on('run-snakemake', async (event, userInput) => {
    const configFile = path.join(configPath, "config.yaml");
    console.log('Running Snakemake with config file:', configFile);
    const snakefileDir = path.dirname(configFile);

    const newContainer = await prepareSnakemakeCommand(userInput, containerName, configFile);
    console.log("New container created: ", newContainer);

    const configFileContainer = "/project/config.yaml";

    // const configFileContainer = await prepareSnakemakeCommand(userInput, containerName, configFile);

    // console.log("Exited from utilities with value: ", configFileContainer);

    // const amrFinderDb = `docker exec ${containerName} bash -c "
    // source /opt/conda/etc/profile.d/conda.sh &&
    // conda activate bacEnv &&
    // amrfinder -u
    // "`;

    // console.log("Updating AMRFinder database...");
    // execSync(amrFinderDb, { stdio: 'inherit' });

    const command = `docker exec ${containerName} bash -c "
    source /opt/conda/etc/profile.d/conda.sh &&
    conda activate bacEnv &&
    snakemake --configfile ${configFileContainer} --force all
    "`;

    // const command = `docker exec ${containerName} bash -c "
    // amrfinder -u &&
    // snakemake --configfile ${configFileContainer} --force all
    // "`;

    
    const child = spawn(command, { cwd: snakefileDir, shell: true });

    // handle snakemake output

    child.stdout.on('data', (data) => {
        console.log(`Snakemake stdout: ${data}`);
        event.reply('snakemake-output', { stdout: data.toString(), stderr: null });
    });

    child.stderr.on('data', (data) => {
        console.error(`Snakemake stderr: ${data}`);
        event.reply('snakemake-output', { stdout: null, stderr: data.toString() });
    });

    child.on('close', (code) => {
        console.log(`Snakemake process exited with code ${code}`);
        if (code !== 0) {
            event.reply('snakemake-output', { stdout: null, stderr: `Snakemake exited with code ${code}` });
        }
    });
});

// save config file
ipcMain.handle('save-file', async (event, yamlData) => {
  const configFile = path.join(configPath, "config.yaml");
  try {
    fs.writeFileSync(configFile, yamlData, 'utf8');
    console.log('File saved as:', configFile);
    return { success: true, filePath: configFile };
  } catch (err) {
    console.error('Error during file saving:', err);
    return { success: false, error: err.message };
  }
});
