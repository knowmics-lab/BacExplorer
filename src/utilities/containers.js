// utils to create Docker container

import { spawn, spawnSync } from 'child_process';
// import { mapIO } from "./docker_utils";
import os                   from 'os';
import fs                   from 'fs-extra';
import { BrowserWindow }    from 'electron';

const yaml = require('js-yaml');
const Docker = require('dockerode');
const path = require('path');

let docker;
const platform = os.platform();

if (platform === 'win32') {
  docker = new Docker({ socketPath: '//./pipe/docker_engine' });
} else if (platform === 'linux' || process.platform === 'darwin') {
  docker = new Docker({ socketPath: '/var/run/docker.sock' });
} else {
  console.error('Unsupported platform: ', process.platform);
}

docker.ping((err, data) => {
  if (err) {
    console.error('Docker connection failed: ', err);
  } else {
    console.log('Docker is connected: ', data);
  }
});

const containerSnakemake = '/project/snakemake';
const containerConfigPath = path.join(containerSnakemake, 'config.yaml');
const containerResPath = path.join(containerSnakemake, 'resources');

export async function setupContainer (imageName, configPath, containerName) {
  // Esegui tutte le operazioni in sequenza
  try {
    await pullImage(imageName);
    await downloadDatabases(configPath);
    await createContainer(imageName, containerName, configPath);
    await startContainer(containerName);

    return 'Container created successfully';
  } catch (error) {
    throw new Error(`Error during container creation: ${error.message}`);
  }
}

// utility for below functions
function emitProgress (status, progress) {
  const window = BrowserWindow.getAllWindows()[0]; // Recupera la finestra principale
  if (window) {
    window.webContents.send('progress', { status, progress });
  } else {
    console.error('No active window to send progress');
  }
}

// pull docker image
async function pullImage (imageName) {
  return new Promise((resolve, reject) => {
    docker.pull(imageName, (err, stream) => {
      if (err) {
        return reject(err);
      }
      docker.modem.followProgress(stream, onFinished, onProgress);
    });

    function onFinished (err, output) {
      if (err) {
        return reject(err);
      }
      resolve('Image pulled successfully.');
    }

    let progress = 0;
    const steps = 3; //pulling from, digest, status
    let layersCounter = 0;

    function onProgress (event) {
      if (event.status) {
        //progress diviso su 3 + number of layers steps = totProg
        // totProg : 100 = 1 : x
        // currentPercentage = 100 / totProg
        //let lastId = null;
        emitProgress('Step 1: fetching image...', progress);

        if (event.status.includes('Pulling from')) {
          emitProgress('Downloading image...', progress);
          console.log('Downloading image...', progress);
        } else if (event.status.includes('Digest')) {
          emitProgress('Image downloaded...', progress);
          console.log('Image downloaded...', progress);
        } else if (event.status.includes('Status')) {
          emitProgress('Completed step 1/4', progress);
          console.log('Completed', progress);
        } else if (event.status.includes('Pulling fs layer')) {
          layersCounter++;
          console.log(`Updating number of layers: ${layersCounter}`);
        } else if (event.status.includes('Downloading') || event.status.includes('Already exists')) {
          // map progress until 98%
          let totalPercentage = steps + layersCounter;
          progress = Math.round((layersCounter / totalPercentage) * 98);
          console.log(event);
          emitProgress('Pulling image...', progress);
        }
      }
    }
  });

}

async function downloadDatabases (configPath) {
  emitProgress('Step 2: Preparing to download databases...', 0);
  const resourcesDir = path.join(configPath, '/resources');
  try {
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir, { recursive: true });
    }
    let platform = os.platform();
    await fetchKrakenDB(resourcesDir, platform);
    await fetchVirulenceDB(resourcesDir, platform);
    emitProgress('Completed step 2/4', 100);

  } catch (error) {
    throw (error);
  }
}

function processCurlOutput (data, statusMessage) {
  const match = data.toString().match(/(\d+)%/);
  if (match) {
    emitProgress(statusMessage, parseInt(match[1]));
  } else {
     // we are on linux/mac, get the last line of the output
    const lines = data.toString().split('\r');
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      const match = lastLine.trim().match(/\s*(\d+)\s+/);
      if (match) {
        emitProgress(statusMessage, parseInt(match[1]));
      }
    }
  }
}

async function downloadFile (source, destination, statusMessage) {
  return new Promise((resolve, reject) => {
    const downloadProcess = spawn('curl', ['-L', source, '-o', destination]);
    downloadProcess.stdout.setEncoding('utf8');
    downloadProcess.stderr.setEncoding('utf8');
    downloadProcess.stdout.on('data', (data) => {
      processCurlOutput(data, statusMessage);
    });
    downloadProcess.stderr.on('data', (data) => {
      processCurlOutput(data, statusMessage);
    });
    downloadProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Download failed with code ${code}`));
      }
    });
  });
}

// download kraken db
async function fetchKrakenDB (resourcesDir, platform) {
  const krakenDir = path.join(resourcesDir, 'kraken2db');
  const krakenDB = 'k2_standard_08gb_20240904.tar.gz';
  const krakenDBPath = 'https://genome-idx.s3.amazonaws.com/kraken/k2_standard_08gb_20240904.tar.gz';
  const tarFilePath = path.join(krakenDir, krakenDB);
  try {
    if (!fs.existsSync(krakenDir)) {
      console.log('Kraken dir not found: creating...');
      fs.mkdirSync(krakenDir, { recursive: true });
    }

    if (fs.existsSync(tarFilePath)) {
      console.log(`Kraken database: ${krakenDB} found in ${krakenDir}. Skipping download`);
      emitProgress('Kraken2DB already exists in folder. Skipping download', 50);
      const files = fs.readdirSync(krakenDir);
      if (files.length === 1 && files[0] === krakenDB) {
        console.log('File zipped: unzipping...');
        emitProgress('Unzipping...', 51);
        const result = spawnSync('tar', ['-xvzf', tarFilePath, '-C', krakenDir], { stdio: 'inherit' });
        console.log('Result of command: ', result);
        emitProgress('Unzipping Kraken2 DB', 100);
      } else {
        console.log('Skipping unzip');
        emitProgress('Kraken2DB already unzipped', 100);
      }
      console.log('Kraken done');
      return;
    } else {
      await downloadFile(krakenDBPath, tarFilePath, 'Downloading Kraken2 DB');

      emitProgress('Unzipping Kraken2 DB', 0);
      spawnSync('tar', ['-xvzf', tarFilePath, '-C', krakenDir], { stdio: 'inherit' });
      // execSync(`tar -xvzf '${tarFilePath}' -C '${krakenDir}'`, { stdio: 'inherit' });
      emitProgress('Unzipping Kraken2 DB', 100);
    }

  } catch (error) {
    throw (error);
  }
}

// download virulence_finder db
async function fetchVirulenceDB (resourcesDir, platform) {
  const vfDBDir = path.join(resourcesDir, 'virulencefinder_db');
  const vfDB = 'master.zip';
  const vfDBPath = 'https://bitbucket.org/genomicepidemiology/virulencefinder_db/get/master.zip';
  const tarFilePath = path.join(vfDBDir, vfDB);
  // const extractionSubdir = "genomicepidemiology-virulencefinder_db-9638945ea72e";
  try {
    if (!fs.existsSync(vfDBDir)) {
      fs.mkdirSync(vfDBDir, { recursive: true });
    }

    if (fs.existsSync(tarFilePath)) {
      console.log(`Virulence finder db: ${vfDB} found in ${vfDBDir}. Skipping download`);
      emitProgress('Virulence finder db already exists in folder. Skipping download', 50);
      const files = fs.readdirSync(vfDBDir);
      if (files.length === 1 && files[0] === vfDB) {
        console.log('File zipped: unzipping...');
        emitProgress('Unzipping...', 51);
        // execSync(`tar -xf '${tarFilePath}' -C '${vfDBDir}'`);
        spawnSync('tar', ['-xf', tarFilePath, '-C', vfDBDir], { stdio: 'inherit' });
        emitProgress('Unzipping Kraken2 DB', 100);
      } else {
        console.log('Skipping unzip');
        emitProgress('Virulence finder db already unzipped', 100);
      }
      console.log('Kraken done');
      return;
    } else {
      await downloadFile(vfDBPath, tarFilePath, 'Downloading VirulenceFinder DB');
      // testare
      emitProgress('Unzipping VirulenceFinder DB', 0);
      // execSync(`tar -xf '${tarFilePath}' -C '${vfDBDir}'`);
      spawnSync('tar', ['-xf', tarFilePath, '-C', vfDBDir], { stdio: 'inherit' });
      emitProgress('Unzipping VirulenceFinder DB', 100);
    }

  } catch (error) {
    throw (error);
  }
}

// function to create container
async function createContainer (imageName, containerName, configPath) {
  emitProgress(`Step 3: Creating container ${containerName}...`, 0);

  try {
    const containers = await docker.listContainers({ all: true });
    const existingContainer = containers.find(container =>
      container.Names.includes(`/${containerName}`),
    );

    if (existingContainer) {
      console.log(`Container ${containerName} already exists:`, existingContainer);
      emitProgress(`Container ${containerName} already exists. Skipping creation.`, 100);
      return;
    }

    await docker.createContainer({
      Image: imageName,
      name: containerName,
      Cmd: ['/bin/bash', '-c', 'while true; do sleep 30; done'],
      HostConfig: {
        // userData/snakemake
        Binds: [`${configPath}:${containerSnakemake}`],
        RestartPolicy: { Name: 'no' },
      },
    });
    const container = docker.getContainer(containerName);
    const containerInfo = await container.inspect();
    console.log(`Container ${container} created: ${containerInfo}`);
    emitProgress('Completed step 3/4: Container created', 100);
  } catch (error) {
    throw (error);
  }
}

async function startContainer (containerName) {
  const container = docker.getContainer(containerName);
  emitProgress(`Step 4: Starting container...`, 0);
  try {
    const containerInfo = await container.inspect();
    if (containerInfo.State.Status === 'running') {
      console.log(`Container ${containerName} is already running.`);

    } else {
      await container.start();
      console.log(`Container ${containerName} started.`);
    }
    emitProgress(`Completed step 4/4: Container started`, 100);
  } catch (error) {
    throw error;
  }
}

// change the INPUT field in the config file of the container
async function updateConfigFile (configFilePath) {
  try {
    const config = yaml.load(fs.readFileSync(configFilePath, 'utf8'));
    config.INPUT = containerInput;

    fs.writeFileSync(configFilePath, yaml.dump(config), 'utf8');
    console.log(`Config file updated: INPUT=${containerInput}`);
  } catch (e) {
    console.error('Errore while updating config file in container: ', e);
  }
}

export async function prepareSnakemakeCommand (containerName, userInput, userConfigPath) {
  const container = docker.getContainer(containerName);
  try {
    // await restartIfNeeded(container, containerName);
    await updateConfigFile(userConfigPath);
    const newContainer = await mapIO(containerName, userInput, userConfigPath);

    // inspect container
    console.log('Inspecting container...');
    const data = await newContainer.inspect();
    const volumes = data.Mounts;

    // Se non ci sono volumi, segnaliamo che non ci sono
    if (!volumes || volumes.length === 0) {
      console.log('No volumes mounted on this container.');
      return;
    }

    volumes.forEach(volume => {
      console.log(`Source: ${volume.Source}, Target: ${volume.Target}, Type: ${volume.Type}`);
    });
    return newContainer;
  } catch (error) {
    console.error('Error in cloning container: ', error);
    throw (error);
  }

}

async function mapIO (containerName, userInput, userConfigPath) {
  const userOutput = path.join(userInput, 'output');
  const containerInput = '/project/user-input';
  const containerOutput = path.join(containerInput, 'output');
  const containerConfigPath = '/project/snakemake';

  const container = docker.getContainer(containerName);

  if (!container) {
    throw new Error(`Container ${containerName} not found`);
  }

  console.log(`Working on: (name) ${containerName} container ${container}`);

  try {
    // Fermare il container se è in esecuzione
    const containerInfo = await container.inspect();
    if (containerInfo.State.Status === 'running') {
      console.log(`Stopping container ${containerName}...`);
      await container.stop();
      console.log(`Container ${containerName} stopped.`);
    }

    // Eliminare il container esistente
    console.log(`Removing container ${containerName}...`);
    await container.remove();
    console.log(`Container ${containerName} removed.`);

    // Ricreare il container con i nuovi volumi
    console.log(`Recreating container ${containerName} with updated volumes...`);
    try {
      await docker.createContainer({
        Image: containerInfo.Config.Image, // Usa l'immagine del container originale
        name: containerName,
        Cmd: [
          '/bin/bash',
          '-c',
          `mkdir -p ${containerInput} && mkdir -p ${containerOutput} && mkdir -p ${containerConfigPath} && \
                    while true; do sleep 30; done`],
        HostConfig: {
          Binds: [
            `${userInput}:${containerInput}`,
            `${userOutput}:${containerOutput}`,
            `${userConfigPath}:${containerConfigPath}`, //in userConfigPath passo userData/snakemake
          ],
        },
      });

    } catch (error) {
      throw (error);
    }
    // Avviare il nuovo container
    const newContainer = docker.getContainer(containerName);
    await newContainer.start();

    console.log('Container recreated and started with updated volumes.');
    return newContainer;

  } catch (error) {
    console.error('Error while dynamic binding of volumes: ', error);
  }
}

// // async function updateContainer(containerName) {
// //     try {
// //         const container = docker.getContainer(containerName);
// //         if (!container) {
// //             throw new Error(`Container ${containerName} not found`);
// //         }

// //         const containerInfo = await container.inspect();
// //         const currentState = containerInfo.State.Status;

// //         // Gestisci stati diversi del container
// //         if (currentState === "exited" || currentState === "restarting" || currentState === "paused") {
// //             console.log(`Container ${containerName} is in state: ${currentState}. Restarting it...`);
// //             await container.stop(); // Fermiamo il container se necessario
// //             await container.start(); // Lo riavviamo
// //             console.log(`Container ${containerName} restarted successfully.`);
// //             await waitForContainerRunning(containerName); // Aspetta che sia running
// //         } else if (currentState !== "running") {
// //             throw new Error(`Container ${containerName} is in an unexpected state: ${currentState}`);
// //         }

// //         console.log("Container is running. Executing commands...");

// //         // // Aggiorna il container con il volume montato
// //         // await container.update({
// //         //     HostConfig: {
// //         //         Binds: [
// //         //             `${volumeName}:${volumeMountPath}`, // Monta il volume nel container
// //         //         ],
// //         //     },
// //         // });

// //         // Esegui i comandi nel container
// //         // amrfinder target directory: /opt/conda/envs/bacEnv/share/amrfinderplus/data/2024-07-22.1/
// //         const exec = await container.exec({
// //             Cmd: ['bash', '-c', `
// //             source /opt/conda/etc/profile.d/conda.sh &&
// //             conda activate bacEnv &&
// //             amrfinder -u &&
// //             abricate-get_db --db card --force &&
// //             abricate-get_db --db argannot --force &&
// //             abricate-get_db --db resfinder --force &&
// //             abricate-get_db --db ecoh --force &&
// //             abricate-get_db --db vfdb --force &&
// //             abricate-get_db --db plasmidfinder --force &&
// //             abricate-get_db --db ecoli_vf --force &&
// //             echo "MLST" &&
// //             env_path="/opt/conda/envs/bacEnv" &&
// //             pubmlst_path="$env_path/pubmlst" &&
// //             mlst-download_pub_mlst -d $pubmlst_path &&
// //             mlst-make_blast_db`],
// //             AttachStdout: true,
// //             AttachStderr: true,
// //         });
// //         console.log("Commands initialized.");

// //         console.log("Starting execution of commands...");
// //         const stream = await exec.start({ hijack: true, stdin: true });

// //         stream.on("data", (data) => {
// //             console.log(data.toString());
// //         });

// //         stream.on("end", () => {
// //             console.log("Command execution completed.");
// //         });
// //     } catch (error) {
// //         console.error("Error executing commands in container:", error);
// //     }
// // }

