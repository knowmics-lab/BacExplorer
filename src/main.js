import { app, BrowserWindow, screen, dialog, ipcMain, Menu, shell } from 'electron';
import started                                                      from 'electron-squirrel-startup';
import { spawn, execSync, exec }                                          from 'child_process';
import os                                                           from 'os';
import fs                                                           from 'fs';
import fsExtra                                                      from 'fs-extra';
import path                                                         from 'path';
import yaml from 'js-yaml';
import { checkDockerInstalled, checkDockerRunning }                 from './utilities/functions.js';
import { setupContainer, prepareSnakemakeCommand, runAnalysis, produceReport }     from './utilities/containers.js';
// per testare su container giocattolo
// import { prepareSnakemakeCommand } from './utilities/docker_utils.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

let mainWindow;

const createWindowsMenu = () => {
  return [
    {
      label: 'Home',
      click: () => {
        navigate('home');
      },
    },
    // {
    //   label: 'Guide',
    //   click: () => {
    //     navigate('guide');
    //   },
    // },
    // {
    //   label: 'Settings',
    //   click: () => {
    //     navigate('settings');
    //   },
    // },
    {
      label: 'Help',
      submenu:
        [
          {
            label: 'GitHub',
            click: () => {
              const { shell } = require('electron');
              shell.openExternal('https://github.com/AdrianaCannata/bacExplorer/tree/main');
            },
          },
        ],
    },
  ];
};

const createDarwinMenu = () => {
  const subMenuAbout = {
    label: 'BacExplorer',
    submenu: [
      {
        label: 'About BacExplorer',
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      { label: 'Services', submenu: [] },
      { type: 'separator' },
      {
        label: 'Hide ElectronReact',
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      { label: 'Show All', selector: 'unhideAllApplications:' },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  };
  const subMenuFile = {
    label: 'File',
    submenu: [
      { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => navigate('settings') },
    ],
  };
  const subMenuEdit = {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  };
  const subMenuWindow = {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
      { type: 'separator' },
      { label: 'Bring All to Front', selector: 'arrangeInFront:' },
    ],
  };
  const subMenuHelp = {
    label: 'Help',
    submenu: [
      {
        label: 'Home',
        click: () => {
          navigate('home');
        },
      },
      {
        label: 'GitHub',
        click: () => {
          const { shell } = require('electron');
          shell.openExternal('https://github.com/AdrianaCannata/bacExplorer/tree/main');
        },
      },
    ],
  };

  return [subMenuAbout, subMenuFile, subMenuEdit, subMenuWindow, subMenuHelp];
};

const createWindow = () => {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
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
  const template = process.platform === 'darwin' ? createDarwinMenu() : createWindowsMenu();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  const userDataPath = app.getPath('userData');

  // const appPath = app.getPath()

  // console.log("App path: ", appPath);

  // var copyFileOutsideOfElectronAsar = function (sourceInAsarArchive, destOutsideAsarArchive) {
  //   console.log("In function to extract asar...");
  //   if (fs.existsSync(path.join(app.getAppPath(), sourceInAsarArchive))) {

  //       // file will be copied
  //       // if (fs.statSync(app.getAppPath() + "/" + sourceInAsarArchive).isFile()) {
  //       if (fs.statSync(path.join(app.getAppPath(), sourceInAsarArchive)).isFile()) {
  //           let file = destOutsideAsarArchive; 
  //           let dir = path.dirname(file);
  //           if (!fs.existsSync(dir)) {
  //               fs.mkdirSync(dir, { recursive: true });
  //           }

  //           //fs.writeFileSync(file, fs.readFileSync(app.getAppPath() + "/" + sourceInAsarArchive));
  //           fs.writeFileSync(file, fs.readFileSync(path.join(app.getAppPath(), sourceInAsarArchive)));

  //       }

  //       // dir is browsed
  //       // else if (fs.statSync(app.getAppPath() + "/" + sourceInAsarArchive).isDirectory()) {
  //       else if (fs.statSync(path.join(app.getAppPath(), sourceInAsarArchive)).isDirectory()) {

  //           // fs.readdirSync(app.getAppPath() + "/" + sourceInAsarArchive).forEach(function (fileOrFolderName) {
  //           fs.readdirSync(path.join(app.getAppPath(), sourceInAsarArchive)).forEach(function (fileOrFolderName) {
  //             console.log("Copying...", fileOrFolderName);
  //             copyFileOutsideOfElectronAsar(path.join(sourceInAsarArchive, fileOrFolderName), path.join(destOutsideAsarArchive, fileOrFolderName));  
  //             // copyFileOutsideOfElectronAsar(sourceInAsarArchive + "/" + fileOrFolderName, destOutsideAsarArchive + "/" + fileOrFolderName);
  //           });
  //       }
  //   }

  // }

  const targetFolder = path.join(userDataPath, 'snakemake');
  let sourceFolder = '';
  if (process.env.NODE_ENV === 'production') {
    sourceFolder = path.join(process.resourcesPath, 'snakemake');
  } else {
    sourceFolder = path.join(__dirname, '../../snakemake');
  }

  console.log('Target folder: ', targetFolder);
  console.log('Source folder: ', sourceFolder);

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
    console.log(`Updating userData. Creating folder: ${targetFolder}`);
  }

  try {
    fsExtra.copySync(sourceFolder, targetFolder);
    console.log('Files successfully copied!');
    // const sourceOutput = execSync(`dir ${sourceFolder}`);
    // console.log(`In source folder: ${sourceOutput}`);
    // const targetOutput = execSync(`dir ${targetFolder}`);
    // console.log(`In target folder: ${targetOutput}`);
  } catch (err) {
    console.error('Error while copying:', err);
    throw (err);
  }

  // if (process.env.NODE_ENV === 'production' || app.getAppPath().includes('.asar')) {
  //   copyFileOutsideOfElectronAsar(sourceFolder, targetFolder);
  // }

  // if (process.env.NODE_ENV !== 'production') {
  //   if (!fs.existsSync(targetFolder)) {
  //     fs.mkdirSync(targetFolder, { recursive: true });
  //     console.log(`Updating userData. Creating folder: ${targetFolder}`);
  //   }

  //   try {
  //     fsExtra.copySync(sourceFolder, targetFolder);
  //     console.log('Files successfully copied!');
  //     // const sourceOutput = execSync(`dir ${sourceFolder}`);
  //     // console.log(`In source folder: ${sourceOutput}`);
  //     // const targetOutput = execSync(`dir ${targetFolder}`);
  //     // console.log(`In target folder: ${targetOutput}`);
  //   } catch (err) {
  //     console.error('Error while copying:', err);
  //     throw(err);
  //   }
  // }

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
const configPath = path.join(app.getPath('userData'), 'snakemake');
const imageName = 'priviteragf/bacexplorer:latest';
const containerName = 'snakemakeContainer';

// ipcMain.on('progress', (event, data) => {
//   const mainWindow = BrowserWindow.getAllWindows()[0];
//   if (mainWindow) {
//       console.log("in main.js: ", data);
//       mainWindow.webContents.send('progress', data);
//   }
// });

ipcMain.handle('open-external', () => {
  let url = '';
  const platform = os.platform();
  if (platform === 'win32') {
    url = 'https://docs.docker.com/desktop/setup/install/windows-install/';
  } else if (platform === 'darwin') {
    url = 'https://docs.docker.com/desktop/setup/install/mac-install/';
  } else if (platform === 'linux') {
    url = 'https://docs.docker.com/engine/install/ubuntu/';
  }
  console.log('Navigating to: ', url);
  shell.openExternal(url);
});

// docker check
ipcMain.handle('docker-installed', async () => {
  try {
    const dockerStatus = await checkDockerInstalled();
    console.log('Docker status:', dockerStatus);
    return dockerStatus;
  } catch (error) {
    console.error('Error checking Docker:', error.message);
    throw new Error('Failed to check Docker installation.');
  }
});

ipcMain.handle('docker-running', async function () {
  try {
    return await checkDockerRunning();
  } catch (error) {
    throw (error);
  }
});

// environment setup
// ipcMain.handle('create-container', async function() {
//   try {
//     const response = await setupContainer(configPath, imageName, containerName);
//     console.log("In main.js: ", response);
//     return response;
//   } catch (error) {
//     throw (error);
//   }
// })

// ipcMain.handle('check-image', async (event) => {
//   try {
//     const response = await pullDockerImage(imageName);
//     console.log(response);
//     return response;
//   } catch (error) {
//     console.error(error);
//     throw(error);
//   }
// })

function navigate (page) {
  console.log('From main process: navigating to', page);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('navigate', page);
  } else {
    console.error('mainWindow o webContents non disponibile');
  }
}

ipcMain.handle('navigate', (event, page) => {
  navigate(page);
});

ipcMain.handle('create-container', async (event) => {
  try {
    console.log(
      `Creating container with parameters: \nIMAGE NAME: ${imageName}\tFOLDER TO MOUNT: ${configPath}\tCONTAINER NAME: ${containerName}`);
    const result = await setupContainer(imageName, configPath, containerName);
    console.log('Result:', result);
    return result;
  } catch (error) {
    let message = error.message;
    if (error.message.includes('connect ENOENT')) {
      message = 'Run Docker first!';
    }
    throw new Error(`Error creating container: ${message}`);
  }
});

// select input folder
ipcMain.handle('dialog:select-folder', async function (event) {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  console.log('filePaths:', filePaths);
  return canceled ? null : filePaths;
});

let originalConfigInput = "";
let userAnalysisName = "";

function saveUserInput(configFile) {
  const originalConfig = yaml.load(fs.readFileSync(configFile, 'utf8'));
  originalConfigInput = originalConfig.INPUT;
  userAnalysisName = originalConfig.NAME;
}

// launch analysis via snakemake
ipcMain.handle('run-snakemake', async (event, userInput) => {
  const configFile = path.join(configPath, 'config.yaml');
  // salva correttamente nella cartella userData

  if (!fs.existsSync(configFile)) {
    console.error(`Config file not found in: ${configFile}`);
    event.reply('setting-error', { stderr: `Config file not found: ${configFile}. Unable to proceed.`, code: 404 });
    return;
  }

  saveUserInput(configFile);

  const snakefileDir = path.dirname(configFile);
  try {
    const dirContent = fs.readdirSync(snakefileDir);
    if (!dirContent.includes('Snakefile')) {
      console.error(`Snakefile not found in: ${snakefileDir}`);
      event.reply('setting-error',
        { stderr: `Snakefile not found in: ${snakefileDir}. Unable to proceed.`, code: 404 });
    }
  } catch (error) {
    event.reply('setting-error', { stderr: error.message, code: 500 });
  }
  console.log('SnakefileDir: ', snakefileDir);

  const newContainer = await prepareSnakemakeCommand(containerName, userInput, snakefileDir);

  console.log('New container created: ', newContainer);

  console.log('Running Snakemake with config file:', configFile);

});

ipcMain.on('launch-analysis', async (event) => {
  await runAnalysis(
    containerName,
    (data) => event.reply('snakemake-output', data),
    (data) => event.reply('snakemake-error', data),
  );
});

// launch the report
// take coverage and identity from config file
// launch report into the container (activate bacEnv before)
// send output to renderer (it will take the percentage to update the progress bar)
ipcMain.on('launch-report', async (event) => {
  await produceReport(containerName,
    data => event.reply('report-output', data),
    data => event.reply('report-error', data),
    configPath,
  );
})

// validate input folder
ipcMain.handle('validate-folder', async (event, inputFolder, type) => {
  const response = {success: false, message: ""};
  try {
    const files = fs.readdirSync(inputFolder);
    let invalidFiles = [];
    if (type === "fasta" || type === "Fasta") {
      invalidFiles = files.filter(file => path.extname(file).toLowerCase() !== `.${type}`);
    } else if (type === "fastq" || type === "Fastq") {
      invalidFiles = files.filter(file => 
        !file.toLowerCase().endsWith(".fq.gz") &&
        !file.toLowerCase().endsWith(".fastq.gz")
      );
    }
    console.log("Invalid files: ", invalidFiles);

    const outputFolder = "output";

    if (invalidFiles.length > 0) {
      if (invalidFiles.includes(outputFolder)) {
        const message = "Output folders already exists: files will be overwritten";
        response.success = true;
        response.message = message;
        console.error(response);
      } else {
        const message = "Input files format does not match specified type";
        response.success = false;
        response.message = message;
        console.error(response);
      }
      return response;
    }
    
    response.success = true;
    response.message = "Ok";
    return response;
  } catch(error) {
    console.error("Error: ", error);
    response.success = false;
    response.message = error.message;
    return response;
  }
})

// save config file
ipcMain.handle('save-file', async (event, yamlData) => {
  const configFile = path.join(configPath, 'config.yaml');
  try {
    fs.writeFileSync(configFile, yamlData, 'utf8');
    console.log('File saved as:', configFile);
    return { success: true, filePath: configFile };
  } catch (err) {
    console.error('Error during file saving:', err);
    return { success: false, error: err.message };
  }
});

// pick report dir
ipcMain.handle('pick-rep-dir', async(event) => {
  // const configFilePath = path.join(configPath, "config.yaml");
  // const config = yaml.load(fs.readFileSync(configFilePath, 'utf8'));
  const analysisName = userAnalysisName;
  const inputFolder = originalConfigInput;
  const reportPath = path.join(inputFolder, "output", `${analysisName}_report.html`);
  return reportPath;
})

ipcMain.handle ('readHTML', async(event, filePath) => {
  return fs.readFileSync(filePath, 'utf8');
}) 