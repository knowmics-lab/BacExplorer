// utils to create Docker container

import { execSync } from "child_process";
import { mapIO } from "./docker_utils";
import os from "os";

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

const containerConfigPath = "/project/config.yaml";
const containerResPath = "/project/resources";

// configPath = global variable in main.js

export async function setupContainer(configPath, imageName, containerName) {
    try {
        await pullDockerImage(imageName);
        await createAndStartContainer(imageName, containerName, configPath);
        // await waitForContainerRunning(containerName);
        // console.log("Container created and started successfully.");
        // await updateContainer(containerName);
        const message = `Image pulled: ${imageName}. Container successfully created: ${imageName}`;
        return message;
    } catch (error) {
        console.error("Failed to create and start container: ", error);
        throw (error);
    }
}

async function pullDockerImage(imageName) {
  return new Promise((resolve, reject) => {
    docker.pull(imageName, (err, stream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err, output) {
        if (err) reject(err);
        resolve("Image pulled successfully.");
      }

      function onProgress(event) {
        console.log(event);
      }
    });
  });
}

async function createAndStartContainer(imageName, containerName, configPath) {
    try {
        const snakemakeDirectory = configPath;
        const resourcesDir = path.join(snakemakeDirectory, "/resources");
        
        execSync(`mkdir -p ${resourcesDir}`);
        
        // krakenDB download
        const krakenDir = path.join(resourcesDir, "kraken2db");
        const krakenDB = "k2_standard_08gb_20240904.tar.gz";
        const krakenDBPath = "https://genome-idx.s3.amazonaws.com/kraken/k2_standard_08gb_20240904.tar.gz";
        execSync(`mkdir -p ${krakenDir}`);
        execSync(`wget ${krakenDBPath} -O ${path.join(krakenDir, krakenDB)} && tar -xvzf ${path.join(krakenDir, krakenDB)} -C ${krakenDir}`, { stdio: 'inherit' });
        
        // virulence_finder_DB download
        const vfDBDir = path.join(resourcesDir, "virulencefinder_db");
        const vfDB = "master.tar.gz";
        const vfDBPath = "https://bitbucket.org/genomicepidemiology/virulencefinder_db/get/master.tar.gz";
        execSync(`wget ${vfDBPath} -O ${path.join(vfDBDir, vfDB)} && tar -xvzf ${path.join(vfDBDir, vfDB)} -C ${vfDBDir}`, { stdio: 'inherit' });
    
        execSync(`mkdir -p ${vfDBDir}`)
    
        // create volumes for dbs
        const amrFinder = "bacExplorer-amrFinder";
        const containerAmrFinder = "/opt/conda/envs/bacEnv/share/amrfinderplus/data/2024-07-22.1/";
        const databases = "bacExplorer-databases";
        const containerDatabases = "/opt/conda/envs/bacEnv/db";
    
        await ensureVolume(amrFinder);
        await ensureVolume(databases);

        const configFile = path.join(configPath, "config.yaml");
        const normalizedConfigPath = path.resolve(configFile);
        const normalizedResDirectory = path.resolve(resourcesDir);

        try {
            // const container = docker.createContainer({
            //     Image: imageName,
            //     name: containerName,
            //     Cmd: ["/bin/bash", "-c", "while true; do sleep 30; done"],
            //     HostConfig: {
            //     Binds: [`${normalizedConfigPath}:${containerConfigPath}` ,
            //         `${normalizedResDirectory}:${containerResPath}`,
            //         `${amrFinder}:${containerAmrFinder}`,
            //         `${databases}:${containerDatabases}`],
            //     RestartPolicy: {
            //         Name: "no",
            //     },
            //     }
            // });
            const container = docker.createContainer({
                Image: imageName,
                name: containerName,
                Cmd: ["/bin/bash", "-c", "while true; do sleep 30; done"],
                HostConfig: {
                Binds: [`${normalizedConfigPath}:${containerConfigPath}` ,
                    `${normalizedResDirectory}:${containerResPath}`,],
                RestartPolicy: {
                    Name: "no",
                },
                }
            });
            try {
                (await container).start();
                console.log(`Container ${containerName} started.`);
            } catch(error) {
                console.error("Error while starting container: ", error);
            }
            
        } catch(error) {
            console.log("Unable to create container: ", error);
        }

    } catch(error) {
        console.error("Unable to create container: ", error);
    }
    
//   return new Promise((resolve, reject) => {
//     const snakemakeDirectory = configPath;
//     const resourcesDir = path.join(snakemakeDirectory, "/resources");
    
//     execSync(`mkdir -p ${resourcesDir}`);
    
//     // krakenDB download
//     const krakenDir = path.join(resourcesDir, "kraken2db");
//     const krakenDB = "k2_standard_08gb_20240904.tar.gz";
//     const krakenDBPath = "https://genome-idx.s3.amazonaws.com/kraken/k2_standard_08gb_20240904.tar.gz";
//     execSync(`mkdir -p ${krakenDir}`);
//     // execSync(`wget ${krakenDBPath} -O ${path.join(krakenDir, krakenDB)} && tar -xvzf ${path.join(krakenDir, krakenDB)} -C ${krakenDir}`, { stdio: 'inherit' });
    
//     // virulence_finder_DB download
//     const vfDBDir = path.join(resourcesDir, "virulencefinder_db");
//     const vfDB = "master.tar.gz";
//     const vfDBPath = "https://bitbucket.org/genomicepidemiology/virulencefinder_db/get/master.tar.gz";
//     // execSync(`wget ${vfDBPath} -O ${path.join(vfDBDir, vfDB)} && tar -xvzf ${path.join(vfDBDir, vfDB)} -C ${vfDBDir}`, { stdio: 'inherit' });

//     execSync(`mkdir -p ${vfDBDir}`)

//     // create volumes for dbs
//     const amrFinder = "bacExplorer-amrFinder";
//     const containerAmrFinder = "/opt/conda/envs/bacEnv/share/amrfinderplus/data/2024-07-22.1/";
//     const databases = "bacExplorer-databases";
//     const containerDatabases = "/opt/conda/envs/bacEnv/db";

//     ensureVolume(amrFinder);
//     ensureVolume()


//     // create container
//     // normalized paths to ensure it works cross-platform
//     const configFile = path.join(configPath, "config.yaml");
//     const normalizedConfigPath = path.resolve(configFile);
//     const normalizedResDirectory = path.resolve(resourcesDir);

//     docker.createContainer({
//         Image: imageName,
//         name: containerName,
//         Cmd: ["/bin/bash", "-c", "while true; do sleep 30; done"],
//         HostConfig: {
//           Binds: [`${normalizedConfigPath}:${containerConfigPath}` ,
//             `${normalizedResDirectory}:${containerResPath}`],
//           RestartPolicy: {
//             Name: "no",
//           },
//         }
//       },
//       (err, container) => {
//         if (err) return reject(err);

//         container.start((err) => {
//           if (err) return reject(err);
//           console.log("Container started successfully.");
//           resolve(`Container ${containerName} started.`);
//         });
//      });
//     })
}

async function waitForContainerRunning(containerName, maxRetries = 10, delayMs = 2000) {
    const container = docker.getContainer(containerName);
    for (let i = 0; i < maxRetries; i++) {
        const containerInfo = await container.inspect();
        if (containerInfo.State.Status === "running") {
            console.log(`Container ${containerName} is running.`);
            return;
        }
        console.log(
            `Container ${containerName} is ${containerInfo.State.Status}. Retrying in ${delayMs}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error(`Container ${containerName} did not reach running state after ${maxRetries} retries.`);
}

async function ensureVolume(volumeName) {
    try {
        const volumes = await docker.listVolumes();
        const volumeExists = volumes.Volumes.some(volume => volume.Name === volumeName);

        if (!volumeExists) {
            console.log(`Volume ${volumeName} does not exist. Creating...`);
            await docker.createVolume({ Name: volumeName });
            console.log(`Volume ${volumeName} created successfully.`);
        } else {
            console.log(`Volume ${volumeName} already exists.`);
        }
    } catch (error) {
        console.error(`Error ensuring volume ${volumeName}:`, error);
    }
}

async function updateContainer(containerName) {
    try {
        const container = docker.getContainer(containerName);
        if (!container) {
            throw new Error(`Container ${containerName} not found`);
        }

        const containerInfo = await container.inspect();
        const currentState = containerInfo.State.Status;

        // Gestisci stati diversi del container
        if (currentState === "exited" || currentState === "restarting" || currentState === "paused") {
            console.log(`Container ${containerName} is in state: ${currentState}. Restarting it...`);
            await container.stop(); // Fermiamo il container se necessario
            await container.start(); // Lo riavviamo
            console.log(`Container ${containerName} restarted successfully.`);
            await waitForContainerRunning(containerName); // Aspetta che sia running
        } else if (currentState !== "running") {
            throw new Error(`Container ${containerName} is in an unexpected state: ${currentState}`);
        }

        console.log("Container is running. Executing commands...");

        // // Aggiorna il container con il volume montato
        // await container.update({
        //     HostConfig: {
        //         Binds: [
        //             `${volumeName}:${volumeMountPath}`, // Monta il volume nel container
        //         ],
        //     },
        // });


        // Esegui i comandi nel container
        // amrfinder target directory: /opt/conda/envs/bacEnv/share/amrfinderplus/data/2024-07-22.1/
        const exec = await container.exec({
            Cmd: ['bash', '-c', `
            source /opt/conda/etc/profile.d/conda.sh &&
            conda activate bacEnv &&
            amrfinder -u &&
            abricate-get_db --db card --force &&
            abricate-get_db --db argannot --force &&
            abricate-get_db --db resfinder --force &&
            abricate-get_db --db ecoh --force &&
            abricate-get_db --db vfdb --force &&
            abricate-get_db --db plasmidfinder --force &&
            abricate-get_db --db ecoli_vf --force &&
            echo "MLST" &&
            env_path="/opt/conda/envs/bacEnv" &&
            pubmlst_path="$env_path/pubmlst" &&
            mlst-download_pub_mlst -d $pubmlst_path &&
            mlst-make_blast_db`],
            AttachStdout: true,
            AttachStderr: true,
        });
        console.log("Commands initialized.");

        console.log("Starting execution of commands...");
        const stream = await exec.start({ hijack: true, stdin: true });

        stream.on("data", (data) => {
            console.log(data.toString());
        });

        stream.on("end", () => {
            console.log("Command execution completed.");
        });
    } catch (error) {
        console.error("Error executing commands in container:", error);
    }
}

