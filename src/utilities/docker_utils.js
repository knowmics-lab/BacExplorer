const fs = require('fs');
const yaml = require('js-yaml');

const Docker = require("dockerode");
const docker = new Docker();

const path = require ("path");

// defined in container_creation.js
const containerConfigPath = "/project/config.yaml";
const containerInput = "/project/user-input/";
const containerOutput = path.join(containerInput, "output");
const containerResPath = "/project/resources";
const containerSnakefile = "/project/Snakefile";
const containerSnakemake = "/project/snakemake";
const volumeName = "bacExplorer-data";
const volumeMountPath = "/opt/conda/envs/bacEnv/share";

export async function prepareSnakemakeCommand(userInput, containerName, userConfigPath) {
    const container = docker.getContainer(containerName);
    console.log("Updating config file in container...");
    // update del config file nel container funziona correttamente.
    // IDEA: creare un volume con la cartella di input data dallo user, fermare il container, montare il volume e avviarlo di nuovo
    // a container riavviato, eseguire snakemake
    // se il container è sempre lo stesso, si possono eseguire all'interno i comandi per amrfinder e l'update dei database
    await updateConfigFile(userConfigPath);

    //steps:
    // 1. stop container
    // 2. update "Binds" in hostconfig.json
    // 3. update config.v2.json

    // await restartIfNeeded(container, containerName);
    // const newContainer = await mapIO(container, containerName, userInput, userConfigPath);

    const data = await container.inspect();

    const volumes = data.Mounts;
        
    // Se non ci sono volumi, segnaliamo che non ci sono
    if (!volumes || volumes.length === 0) {
        console.log('No volumes mounted on this container.');
        return;
    }

    volumes.forEach(volume => {
        console.log(`Source: ${volume.Source}, Target: ${volume.Target}, Type: ${volume.Type}`);
    });
    return container;
}

// change the INPUT field in the config file of the container
async function updateConfigFile(configFilePath) {
  try {
    const config = yaml.load(fs.readFileSync(configFilePath, 'utf8'));
    config.INPUT = containerInput;

    fs.writeFileSync(configFilePath, yaml.dump(config), 'utf8');
    console.log(`Config file updated: INPUT=${containerInput}`);
  } catch (e) {
    console.error('Errore while updating config file in container: ', e);
  }
}

// async function restartIfNeeded(container, containerName) {
//     try {
//         const containerInfo = await container.inspect();

//         if (containerInfo.State.Status === 'running') {
//             console.log(`Container ${containerName} is running. Stopping...`);
//             await container.stop();
//             console.log(`Container ${containerName} stopped.`);
//         } else {
//             console.log(`Container ${containerName} is not running. No need to stop.`);
//         }
//     } catch (error) {
//         console.error("Error checking container: ", error);
//     }
// }

async function restartIfNeeded(container, containerName) {
    try {
        const containerInfo = await container.inspect();

        if (containerInfo.State.Status === 'running') {
            console.log(`Container ${containerName} is running. No need to stop.`);
        } else {
            console.log(`Container ${containerName} is not running. Restarting...`);
            await container.start();
        }
    } catch (error) {
        console.error("Error checking container: ", error);
    }
}


async function mapIO(container, containerName, userInput, userConfigPath) {
    const userOutput = path.join(userInput, "output");

    const snakemakeDirectory = path.dirname(userConfigPath);
    const userResources = path.join(snakemakeDirectory, "/resources");
    const snakeFile = path.join(snakemakeDirectory, "/Snakefile");

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
        const newContainer = await docker.createContainer({
            Image: containerInfo.Config.Image, // Usa l'immagine del container originale
            name: containerName,
            Cmd: ["/bin/bash", "-c", "while true; do sleep 30; done"],
            HostConfig: {
                Binds: [
                    `${userInput}:${containerInput}`,
                    `${userOutput}:${containerOutput}`,
                    `${userConfigPath}:${containerConfigPath}`,
                    `${userResources}:${containerResPath}`,
                    `${snakemakeDirectory}:${containerSnakemake}`,
                ]
            }
        });

        // Avviare il nuovo container
        await newContainer.start();

        // const exec = await container.exec({Cmd: ["/bin/bash", "-c", `
        //     curl 'https://www.drive5.com/downloads/usearch11.0.667_i86linux32.gz' --output usearch11.0.667_i86linux32.gz && 
        //     gunzip usearch11.0.667_i86linux32.gz && 
        //     chmod 755 usearch11.0.667_i86linux32 && 
        //     cp ./usearch11.0.667_i86linux32 /opt/conda/envs/bacEnv/bin/
        //     `],
        //     AttachStdout: true,
        //     AttachStderr: true,
        // })

        // console.log("Adding usearch...");
        // const stream = await exec.start({ hijack: true, stdin: true });

        // stream.on("data", (data) => {
        //     console.log(data.toString());
        // });

        // stream.on("end", () => {
        //     console.log("Usearch added.");
            
        // });

        console.log('Container recreated and started with updated volumes.');
        return newContainer;

    } catch (error) {
        console.error("Error while dynamic binding of volumes: ", error);
    }
}


// async function mapIO(container, containerName, userInput, userConfigPath) {
//     const userOutput = path.join(userInput, "output");

//     try {

//         await container.update({
//             HostConfig: {
//                 Binds: [
//                     `${userInput}:${containerInput}`,
//                     `${userOutput}:${containerOutput}`,
//                     `${userConfigPath}:${containerConfigPath}`,
//                 ]
//             }  
//         })
//         console.log('Container volumes updated.');
   
//     } catch(error) {
//         console.error("Error while dynamic binding of volumes: ", error);
//     }
// }

// export function runCommand(container) {

// }    
    
//     const exec = container.exec({
//         Cmd: ['bash', '-c', `
//         source /opt/conda/etc/profile.d/conda.sh &&
//         conda activate bacEnv &&
//         snakemake --configfile ${containerConfigPath} --force all
//         `],
//         AttachStdout: true,
//         AttachStderr: true,
//     });

//     const stream = exec.start({ hijack: true, stdin: true });

//     stream.on('data', (data) => {
//         console.log(data.toString());
//     });

//     stream.on('end', () => {
//         console.log('Completata l\'esecuzione di Snakemake');
//     });
//     });

// }