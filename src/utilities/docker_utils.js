import fs from 'fs';
import os from 'os';
const yaml = require('js-yaml');
const path = require ("path");
const Docker = require("dockerode");

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

export async function prepareSnakemakeCommand(userInput, containerName = "amazing_blackburn", userConfigPath) {
    const container = docker.getContainer(containerName);
    try {
        // await restartIfNeeded(container, containerName);
        const newContainer = await mapIO(containerName, userInput, userConfigPath);

        // inspect container
        console.log("Inspecting container...");
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
    } catch(error) {
        console.error("Error in preparing execution: ", error);
        throw(error);
    }
    
}


async function mapIO(userInput, userConfigPath) {
    const userOutput = path.join(userInput, "output");
    const containerInput = "/project/user-input";
    const containerOutput = path.join(containerInput, "output");
    const containerConfigPath = "/project/snakemake";
    // non serve più, si monta direttamente userData
    // const snakemakeDirectory = path.dirname(userConfigPath);
    // const userResources = path.join(snakemakeDirectory, "/resources");
    // const snakeFile = path.join(snakemakeDirectory, "/Snakefile");

    const containerName = "zealous_ishizaka"
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
                Cmd: ["/bin/bash", "-c", `mkdir -p ${containerInput} && mkdir -p ${containerOutput} && mkdir -p ${containerConfigPath} $$ \
                    while true; do sleep 30; done`],
                HostConfig: {
                    Binds: [
                        `${userInput}:${containerInput}`,
                        `${userOutput}:${containerOutput}`,
                        `${userConfigPath}:${containerConfigPath}`, //in userConfigPath passo userData/snakemake
                    ]
                }
            });
            
        } catch(error) {
            throw(error);
        }
        // Avviare il nuovo container
        const newContainer = docker.getContainer(containerName);
        await newContainer.start();

        console.log('Container recreated and started with updated volumes.');
        return newContainer;

    } catch (error) {
        console.error("Error while dynamic binding of volumes: ", error);
    }
}

