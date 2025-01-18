// utils to create Docker container

import { execSync } from "child_process";
import { ipcMain } from "electron";
import { mapIO } from "./docker_utils";
import os from "os";
import fs from 'fs';
import { BrowserWindow } from "electron";
import { EventEmitterAsyncResource } from "events";

const Docker = require("dockerode");
const path = require ("path");

let docker;
const platform = os.platform();

if (platform === "win32") {
    docker = new Docker({ socketPath: '//./pipe/docker_engine' });
} else if (platform === "linux" || process.platform === "darwin") {
    docker = new Docker({socketPath: '/var/run/docker.sock'});
} else {
    console.error("Unsupported platform: ", process.platform);
}
  
docker.ping((err, data) => {
if (err) {
    console.error("Docker connection failed: ", err);
} else {
    console.log("Docker is connected: ", data);
}
});

const containerSnakemake = "/project/snakemake";
const containerConfigPath = path.join(containerSnakemake, "config.yaml");
const containerResPath = path.join(containerSnakemake, "resources");

export async function setupContainer(imageName, configPath, containerName) {
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
function emitProgress(status, progress) {
    const window = BrowserWindow.getAllWindows()[0]; // Recupera la finestra principale
    if (window) {
        window.webContents.send('progress', { status, progress });
    } else {
        console.error('No active window to send progress');
    }
}

// pull docker image
async function pullImage(imageName) {
    return new Promise((resolve, reject) => {
        docker.pull(imageName, (err, stream) => {
            if (err){
                return reject(err);
            }
            docker.modem.followProgress(stream, onFinished, onProgress);
        });

        function onFinished(err, output) {
            if (err) {
                return reject(err);
            }       
            resolve('Image pulled successfully.');
        }

        function onProgress(event) {
            if (event.status) {
                let progress = 0;
                emitProgress('Step 1: fetching image...', progress);
        
                if (event.status.includes('Pulling from')) {
                    progress = 10;
                    emitProgress('Downloading image...', progress);
                    console.log('Downloading image...', progress);
                } else if (event.status.includes('Digest')) {
                    progress = 99;
                    emitProgress('Image downloaded...', progress);
                    console.log('Image downloaded...', progress);
                } else if (event.status.includes('Status')) {
                    progress = 100;
                    emitProgress('Completed step 1/4', progress);
                    console.log('Completed', progress);
                }
        
                if (event.progressDetail) {
                    progress = Math.round((event.progressDetail.current / event.progressDetail.total) * 100);
                    emitProgress('Pulling image...', progress);
                }
            }  
        }
    });

    
}

async function downloadDatabases(configPath) {
    emitProgress("Step 2: Preparing to download databases...", 0);
    const snakemakeDirectory = configPath;
    const resourcesDir = path.join(snakemakeDirectory, "/resources");
    try {
        if (!fs.existsSync(resourcesDir)) {
            fs.mkdirSync(resourcesDir, { recursive: true });
        }
    } catch(error) {
        throw(error);
    }

    let platform = os.platform();
    await fetchKrakenDB(resourcesDir, platform);
    await fetchVirulenceDB(resourcesDir, platform);
    emitProgress('Completed step 2/4', 100);
}

// download kraken db
async function fetchKrakenDB(resourcesDir, platform ) {
    const krakenDir = path.join(resourcesDir, "kraken2db");
    const krakenDB = "k2_standard_08gb_20240904.tar.gz";
    const krakenDBPath = "https://genome-idx.s3.amazonaws.com/kraken/k2_standard_08gb_20240904.tar.gz";
    const tarFilePath = path.join(krakenDir, krakenDB);
    if (!fs.existsSync(krakenDir)) {
        fs.mkdirSync(krakenDir, { recursive: true });
    }

    if(fs.existsSync(tarFilePath)) {
        console.log(`Kraken database: ${krakenDB} found in ${krakenDir}. Skipping download`);
        emitProgress("Kraken2DB already exists in folder. Skipping download", 50);
        const files = fs.readdirSync(krakenDir);
        if(files.length === 1 && files[0] === krakenDB) {
            console.log("File zipped: unzipping...");
            emitProgress("Unzipping...", 51);
            execSync(`tar -xvzf ${tarFilePath} -C ${krakenDir}`, { stdio: 'inherit' });
            emitProgress("Unzipping Kraken2 DB", 100);
        } else {
            console.log("Skipping unzip");
            emitProgress("Kraken2DB already unzipped", 100);
        }
        console.log("Kraken done");
        return;
    }

    try {
        const curlCommand = `curl -L ${krakenDBPath} -o ${path.join(krakenDir, krakenDB)}`;
        const downloadProcess = execSync(curlCommand, { stdio: 'pipe' });
        downloadProcess.stdout.on('data', (data) => {
            // Analizza l'output di curl
            const match = data.toString().match(/(\d+)%/);
            if (match) {
                emitProgress("Downloading Kraken2 DB", parseInt(match[1]));
            }
        });

        

        emitProgress("Unzipping Kraken2 DB", 0);
        execSync(`tar -xvzf ${tarFilePath} -C ${krakenDir}`, { stdio: 'inherit' });
        emitProgress("Unzipping Kraken2 DB", 100);
    } catch(error) {
        throw(error);
    }
}

// download virulence_finder db
async function fetchVirulenceDB(resourcesDir, platform) {
    const vfDBDir = path.join(resourcesDir, "virulencefinder_db");
    const vfDB = "master.zip";
    const vfDBPath = "https://bitbucket.org/genomicepidemiology/virulencefinder_db/get/master.zip";
    const tarFilePath = path.join(vfDBDir, vfDB);
    // const extractionSubdir = "genomicepidemiology-virulencefinder_db-9638945ea72e";
    if (!fs.existsSync(vfDBDir)) {
        fs.mkdirSync(vfDBDir, { recursive: true });
    }

    if(fs.existsSync(tarFilePath)) {
        console.log(`Virulence finder db: ${vfDB} found in ${vfDBDir}. Skipping download`);
        emitProgress("Virulence finder db already exists in folder. Skipping download", 50);
        const files = fs.readdirSync(vfDBDir);
        if(files.length === 1 && files[0] === vfDB) {
            console.log("File zipped: unzipping...");
            emitProgress("Unzipping...", 51);
            execSync(`tar -xf ${tarFilePath} -C ${vfDBDir}`);
            emitProgress("Unzipping Kraken2 DB", 100);
        } else {
            console.log("Skipping unzip");
            emitProgress("Virulence finder db already unzipped", 100);
        }
        console.log("Kraken done");
        return;
    }

    try { //PROBLEMA CON WINDOWS
        // const curlCommand = `curl -L ${vfDBPath} -O ${tarFilePath}`;
        const curlCommand = execSync(`powershell -Command "Invoke-WebRequest -Uri '${vfDBPath}' -OutFile '${tarFilePath}'"`, { stdio: 'inherit' });
        const downloadProcess = execSync(curlCommand, { stdio: 'pipe' });
        downloadProcess.stdout.on('data', (data) => {
            const match = data.toString().match(/(\d+)%/);
            if (match) {
                emitProgress("Downloading VirulenceFinder DB", parseInt(match[1]));
            }
        });
        
        // testare
        emitProgress("Unzipping VirulenceFinder DB", 0);
        execSync(`tar -xf ${tarFilePath} -C ${vfDBDir}`);
        emitProgress("Unzipping VirulenceFinder DB", 100);
    } catch(error) {
        throw(error);
    }
}

// function to create container
async function createContainer(imageName, containerName, configPath) {
    emitProgress(`Step 3: Creating container ${containerName}...`, 0);

    try {
        const containers = await docker.listContainers({ all: true });
        const existingContainer = containers.find(container =>
            container.Names.includes(`/${containerName}`)
        );

        if (existingContainer) {
            console.log(`Container ${containerName} already exists:`, existingContainer);
            emitProgress(`Container ${containerName} already exists. Skipping creation.`, 100);
            return;
        }

        await docker.createContainer({
            Image: imageName,
            name: containerName,
            Cmd: ["/bin/bash", "-c", "while true; do sleep 30; done"],
            HostConfig: {
                // userData/snakemake
                Binds: [`${configPath}:${containerSnakemake}`],
                RestartPolicy: { Name: "no" },
            }
        });
        const container = docker.getContainer(containerName);
        const containerInfo = await container.inspect();
        console.log(`Container ${container} created: ${containerInfo}`);
        emitProgress('Completed step 3/4: Container created', 100);
    } catch(error) {
        throw(error);
    }
}

async function startContainer(containerName)
{
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

    



// async function updateContainer(containerName) {
//     try {
//         const container = docker.getContainer(containerName);
//         if (!container) {
//             throw new Error(`Container ${containerName} not found`);
//         }

//         const containerInfo = await container.inspect();
//         const currentState = containerInfo.State.Status;

//         // Gestisci stati diversi del container
//         if (currentState === "exited" || currentState === "restarting" || currentState === "paused") {
//             console.log(`Container ${containerName} is in state: ${currentState}. Restarting it...`);
//             await container.stop(); // Fermiamo il container se necessario
//             await container.start(); // Lo riavviamo
//             console.log(`Container ${containerName} restarted successfully.`);
//             await waitForContainerRunning(containerName); // Aspetta che sia running
//         } else if (currentState !== "running") {
//             throw new Error(`Container ${containerName} is in an unexpected state: ${currentState}`);
//         }

//         console.log("Container is running. Executing commands...");

//         // // Aggiorna il container con il volume montato
//         // await container.update({
//         //     HostConfig: {
//         //         Binds: [
//         //             `${volumeName}:${volumeMountPath}`, // Monta il volume nel container
//         //         ],
//         //     },
//         // });


//         // Esegui i comandi nel container
//         // amrfinder target directory: /opt/conda/envs/bacEnv/share/amrfinderplus/data/2024-07-22.1/
//         const exec = await container.exec({
//             Cmd: ['bash', '-c', `
//             source /opt/conda/etc/profile.d/conda.sh &&
//             conda activate bacEnv &&
//             amrfinder -u &&
//             abricate-get_db --db card --force &&
//             abricate-get_db --db argannot --force &&
//             abricate-get_db --db resfinder --force &&
//             abricate-get_db --db ecoh --force &&
//             abricate-get_db --db vfdb --force &&
//             abricate-get_db --db plasmidfinder --force &&
//             abricate-get_db --db ecoli_vf --force &&
//             echo "MLST" &&
//             env_path="/opt/conda/envs/bacEnv" &&
//             pubmlst_path="$env_path/pubmlst" &&
//             mlst-download_pub_mlst -d $pubmlst_path &&
//             mlst-make_blast_db`],
//             AttachStdout: true,
//             AttachStderr: true,
//         });
//         console.log("Commands initialized.");

//         console.log("Starting execution of commands...");
//         const stream = await exec.start({ hijack: true, stdin: true });

//         stream.on("data", (data) => {
//             console.log(data.toString());
//         });

//         stream.on("end", () => {
//             console.log("Command execution completed.");
//         });
//     } catch (error) {
//         console.error("Error executing commands in container:", error);
//     }
// }

