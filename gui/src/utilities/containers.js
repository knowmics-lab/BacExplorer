// utils to create and manage Docker container

import { spawnSync } from 'child_process';
import os from 'os';
import fs from 'fs-extra';
import { emitProgress, checkDir, isArchitectureARM, demuxStream, downloadFile } from './general_functions';
import { appVariables } from './global_variables';

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

const containerInput = "/project/user-input/";
const containerOutput = "/project/user-input/output/";

// GENERAL-USE FUNCTIONS TO HANDLE OR INSPECT CONTAINERS

export async function checkContainerRunning(containerName) {
  const container = docker.getContainer(containerName);
  try {
    const containerInfo = await container.inspect();
    if (containerInfo.State.Status === 'running') {
      console.log(`Container ${containerName} is already running.`);

    } else {
      await container.start();
      console.log(`Container ${containerName} started.`);
    }
    const response = "Container running";
    return response;
  } catch (error) {
    throw error;
  }
}

export async function stopContainer(containerName) {
  const container = docker.getContainer(containerName);
  try {
    const containerInfo = await container.inspect();
    if (containerInfo.State.Status === 'running') {
      console.log(`Container ${containerName} is running. Stopping...`);
      await container.stop();
      console.log(`Container ${containerName} successfully stopped.`);
    } else if (containerInfo.State.Status === 'exited') {
      console.log(`Container ${containerName} already stopped.`);
    }
    const response = "Container stopped";
    return response;
  } catch (error) {
    throw (error);
  }
}

async function containerExists(containerName) {
    const containers = await docker.listContainers({ all: true });
    const existingContainer = containers.find(container =>
      container.Names.includes(`/${containerName}`),
    );

    if (existingContainer) {
      console.log(`Container ${containerName} already exists: ${existingContainer}`);
      emitProgress(`Container ${containerName} already exists. Skipping creation.`, 100);
      return true;
    }
    console.log(`Container ${containerName} does not exist. Creating...`);
    return false;
}


// FUNCTIONS RUNNING IN THE SETUP PHASE TO CREATE THE CONTAINER

// TO DO: check if the downloaded image is the latest version. Otherwise produce a message to redirect to setup container

// function for first setup
export async function setupContainer(imageName, backendPath, containerName) {
  try {
    await pullImage(imageName);
    await downloadDatabases(backendPath);
    await fetchTrimGalore(backendPath);
    await createContainer(imageName, containerName, backendPath);
    await startContainer(containerName);
    await updateContainer(containerName);

    return 'Container created successfully';
  } catch (error) {
    throw new Error(`Error during container creation: ${error.message}`);
  }
}

// pull docker image
async function pullImage(imageName) {
  return new Promise((resolve, reject) => {
    docker.pull(imageName, { platform: 'linux/amd64' }, (err, stream) => {
      if (err) {
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

    let progress = 0;
    const steps = 3;
    let layersCounter = 0;

    function onProgress(event) {
      if (event.status) {
        // progress divided in 3 + number of layers steps = totProg
        // totProg : 100 = 1 : x
        // currentPercentage = 100 / totProg

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

// download databases into the local machine
async function downloadDatabases(backendPath) {
  emitProgress('Step 2: Preparing to download databases...', 0);
  const resourcesDir = path.join(backendPath, 'resources');
  try {
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir, { recursive: true });
    }
    await fetchKrakenDB(resourcesDir);
    await fetchVirulenceDB(resourcesDir);
    await fetchGenomadDB(resourcesDir);
    emitProgress('Completed step 2/4', 100);

  } catch (error) {
    throw (error);
  }
}

// download kraken db into the "resources" directory
async function fetchKrakenDB(resourcesDir) {
  const krakenDir = path.join(resourcesDir, 'kraken2db');
  const krakenDB = 'k2_standard_08gb_20240904.tar.gz';
  const krakenDBPath = 'https://genome-idx.s3.amazonaws.com/kraken/k2_standard_08gb_20240904.tar.gz';
  const tarFilePath = path.join(krakenDir, krakenDB);

  try {
    checkDir(krakenDir);

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
      emitProgress('Unzipping Kraken2 DB', 100);
      // fs.unlink(tarFilePath, err => {
      //   console.log("Removing zipped Kraken db...");
      //   if (err) {
      //     throw ("Error while removing zipped file: ", err);
      //   }
      //   console.log("Zipped file removed successfully");
      // })
    }
  } catch (error) {
    throw ("Error in fetchkrakendb: ", error);
  }
}

// download virulence_finder db into the "resources" directory
async function fetchVirulenceDB(resourcesDir) {
  const vfDBDir = path.join(resourcesDir, 'virulencefinder_db');
  const vfDB = 'master.tar.gz';
  const vfDBPath = 'https://bitbucket.org/genomicepidemiology/virulencefinder_db/get/master.tar.gz';
  const tarFilePath = path.join(vfDBDir, vfDB);
  try {
    checkDir(vfDBDir);

    if (fs.existsSync(tarFilePath)) {
      console.log(`VirulenceFinder db: ${vfDB} found in ${vfDBDir}. Skipping download`);
      emitProgress('VirulenceFinder db already exists in folder.Skipping download', 50);
      const files = fs.readdirSync(vfDBDir);
      if (files.length === 1 && files[0] === vfDB) {
        console.log('File zipped: unzipping...');
        emitProgress('Unzipping...', 51);
        spawnSync('tar', ['-xvf', tarFilePath, '-C', vfDBDir, '--strip-components', '1'], { stdio: 'inherit' });
        emitProgress('Unzipping VirulenceFinder DB', 100);
      } else {
        console.log('Skipping unzip');
        emitProgress('VirulenceFinder db already unzipped', 100);
      }
      console.log('VirulenceFinder done');
      return;
    } else {
      await downloadFile(vfDBPath, tarFilePath, 'Downloading VirulenceFinder DB');
      emitProgress('Unzipping VirulenceFinder DB', 0);
      spawnSync('tar', ['-xvf', tarFilePath, '-C', vfDBDir, '--strip-components', '1'], { stdio: 'inherit' });
      emitProgress('Unzipping VirulenceFinder DB', 100);
      // fs.unlink(tarFilePath, err => {
      //   console.log("Removing zipped VirulenceFinder DB...");
      //   if (err) {
      //     throw ("Error while removing zipped file: ", err);
      //   }
      //   console.log("Zipped file removed successfully");
      // })
    }
  } catch (error) {
    throw ("Error in fetchvirulencefinderdb: ", error);
  }
}

// download genomad_db into the "resources" directory
async function fetchGenomadDB(resourcesDir) {
  const genomadDir = path.join(resourcesDir, 'genomad_db');
  const genomadDB = "genomad_db.tar.gz";
  const genomadDBPath = "https://zenodo.org/records/14886553/files/genomad_db_v1.9.tar.gz";
  const tarFilePath = path.join(genomadDir, genomadDB);

  try {
    checkDir(genomadDir);
    if (fs.existsSync(tarFilePath)) {
      console.log(`Genomad db: ${genomadDB} found in ${genomadDir}. Skipping download`);
      emitProgress('Genomad db already exists in folder. Skipping download', 50);
      const files = fs.readdirSync(genomadDir);
      if (files.length === 1 && files[0] === genomadDB) {
        console.log('File zipped: unzipping...');
        emitProgress('Unzipping...', 51);
        spawnSync('tar', ['-xvf', tarFilePath, '-C', genomadDir, '--strip-components', '1'], { stdio: 'inherit' });
        emitProgress('Unzipping Genomad DB', 100);
      } else {
        console.log('Skipping unzip');
        emitProgress('Genomad db already unzipped', 100);
      }
      console.log('Genomad done');
      return;
    } else {
      await downloadFile(genomadDBPath, tarFilePath, 'Downloading Genomad DB');
      emitProgress('Unzipping Genomad DB', 0);
      spawnSync('tar', ['-xvf', tarFilePath, '-C', genomadDir, '--strip-components', '1'], { stdio: 'inherit' });
      emitProgress('Unzipping Genomad DB', 100);
    }
  } catch (error) {
    throw ("Error in fetchgenomaddb: ", error);
  }
}

// download TrimGalore into the "tools" directory
async function fetchTrimGalore(snakemakePath) {
  const toolsPath = path.join(snakemakePath, 'tools');
  const trimGaloreDir = path.join(toolsPath, 'TrimGalore-master');
  const trimGalore = "master.zip";
  const trimGaloreSource = "https://github.com/FelixKrueger/TrimGalore/archive/refs/heads/master.zip";
  const tarFilePath = path.join(trimGaloreDir, trimGalore);

  try {
    checkDir(toolsPath);
    checkDir(trimGaloreDir);
    if (fs.existsSync(tarFilePath)) {
      console.log(`TrimGalore: ${trimGalore} found in ${trimGaloreDir}. Skipping download`);
      emitProgress('TrimGalore already exists in folder. Skipping download', 50);
      const files = fs.readdirSync(trimGaloreDir);
      if (files.length === 1 && files[0] === trimGalore) {
        console.log('File zipped: unzipping...');
        emitProgress('Unzipping...', 51);
        spawnSync('tar', ['-xvf', tarFilePath, '-C', trimGaloreDir, '--strip-components', '1'], { stdio: 'inherit' });
        emitProgress('Unzipping TrimGalore', 100);
      } else {
        console.log('Skipping unzip');
        emitProgress('TrimGalore already unzipped', 100);
      }
      console.log('TrimGalore done');
      return;
    } else {
      await downloadFile(trimGaloreSource, tarFilePath, 'Downloading TrimGalore');
      emitProgress('Unzipping TrimGalore', 0);
      spawnSync('tar', ['-xvf', tarFilePath, '-C', trimGaloreDir, '--strip-components', '1'], { stdio: 'inherit' });
      emitProgress('Unzipping TrimGalore', 100);
    }
  } catch (error) {
    throw ("Error in fetchTrimGalore: ", error);
  }
}

// create container with the snakemake folder as volumes; mount into the host machine dbs to update directly into the container
async function createContainer(imageName, containerName, snakemakePath) {
  emitProgress(`Step 3: Creating container ${containerName}...`, 0);
  console.log("Mounting host snakemake path: ", snakemakePath);
  // mount snakemake folder (host machine) in container
  const toolsPath = path.join(snakemakePath, "tools");
  const containerToolsPath = "/project/snakemake/tools";
  const resourcesPath = path.join(snakemakePath, "resources");
  const containerResPath = "/project/snakemake/resources";

  // mount dbs (container conda env) in host machine
  const amrfinderHostPath = path.join(snakemakePath, "resources", "amrfinder");
  const amrfinderVolume = '/opt/conda/envs/bacEnv/share/amrfinderplus';
  // volume for abricate and pubmlst databases
  const dbsHostPath = path.join(snakemakePath, "resources", "dbs");
  const dbsVolume = '/opt/conda/envs/bacEnv/db';

  try {
    console.log("Checking directory...");
    checkDir(amrfinderHostPath);

    const containerCheck = await containerExists(containerName);

    if (!containerCheck) {
      console.log("Container does not exist: creating");
      await docker.createContainer({
        Image: imageName,
        name: containerName,
        Cmd: ['/bin/bash', '-c', `while true; do sleep 30; done`],

        Volumes: {
          [`${containerToolsPath}`]: {},
          [`${amrfinderVolume}`]: {},
          [`${containerResPath}`]: {},
          [`${dbsVolume}`]: {},
        },
        HostConfig: {
          Binds: [
            `${toolsPath}:${containerToolsPath}`,
            `${amrfinderHostPath}:${amrfinderVolume}`,
            `${resourcesPath}:${containerResPath}`,
            `${dbsHostPath}:${dbsVolume}`,
          ],
          RestartPolicy: { Name: 'no' },
        },
      });
      const container = docker.getContainer(containerName);
      const containerInfo = await container.inspect();
      console.log(`Container ${containerName} created`);
      const volumes = containerInfo.Mounts;

      if (!volumes || volumes.length === 0) {
        console.log('No volumes mounted on this container.');
        return;
      }

      volumes.forEach(volume => {
        console.log(`Source: ${volume.Source}, Target: ${volume.Target}, Type: ${volume.Type}`);
      });
      emitProgress('Completed step 3/4: Container created', 100);
    }
    
  } catch (error) {
    throw (error);
  }
}

// function to start the container in the setup phase, after the creation
async function startContainer(containerName) {
  try {
    emitProgress(`Step 4: Starting container...`, 0);
    await checkContainerRunning(containerName);
    emitProgress(`Step 4: Starting container...`, 100);
  } catch (error) {
    throw (error);
  }
}

// install databases inside the container (setup phase)
async function updateContainer(containerName) {
  emitProgress(`Step 5: Installing databases...`, 0);
  console.log("Installing amrfinder, abricate, pubmlst databases...");
  const virulencefinderDbDir = "/project/snakemake/resources/virulencefinder_db";

  const container = docker.getContainer(containerName);
  const exec = await container.exec({
    Cmd: ['bash', '-c', `. /opt/conda/etc/profile.d/conda.sh &&
      conda activate bacEnv &&
      cd ${virulencefinderDbDir} && 
      python ${virulencefinderDbDir}/INSTALL.py &&
      amrfinder -u &&
      abricate-get_db --db card --force &&
      abricate-get_db --db argannot --force &&
      abricate-get_db --db resfinder --force &&
      abricate-get_db --db ecoh --force &&
      abricate-get_db --db vfdb --force &&
      abricate-get_db --db plasmidfinder --force &&
      abricate-get_db --db ecoli_vf --force &&
      pubmlst_path="/opt/conda/envs/bacEnv/db/pubmlst" &&
      mlst-download_pub_mlst -d $pubmlst_path &&
      mlst-make_blast_db
    `],
    // Cmd: ['bash', '-c', `. /opt/conda/etc/profile.d/conda.sh &&
    //   conda activate bacEnv &&
    //   cd ${virulencefinderDbDir} && 
    //   python ${virulencefinderDbDir}/INSTALL.py
    // `],
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
  });
  const stream = await exec.start({ hijack: true, stdin: true });
  let progress = 0;
  await demuxStream(
    stream,
    (data) => {
      console.log(`Stdout: ${data}`);
      if (data.match(/(Done)/)) {
        progress += 11;
      }
      emitProgress(data, progress);
    },
    (data) => {
      console.error(`Stderr: ${data}`);
      if (data.match(/(Done)/)) {
        progress += 11;
      }
      emitProgress(data, progress);
    },
    () => {
      (async () => {
        const d = await exec.inspect();
        const code = (d) ? d.ExitCode : null;
        console.log(`Process exited with code: ${code}`);
        if (code !== 0) {
          throw new Error(`Process exited with code: ${code}`);
        }
      })().catch(console.error);
    },
    async () => {
      const d = await exec.inspect();
      return !!(d && d.Running);
    }
  );
  emitProgress(`Step 5: Installing databases...`, 100);
  console.log("Amrfinder, abricate, pubmlst databases installed and upgraded");
  return;
}

//FUNCTIONS TO HANDLE SNAKEMAKE ANALYSIS

// change the INPUT field in the config file of the container
async function updateConfigFile(configFilePath) {
  try {
    const config = yaml.load(fs.readFileSync(configFilePath, 'utf8'));
    config.INPUT = containerInput;
    // stop genomad execution if host architecture is ARM
    if (isArchitectureARM()) {
      config.GENOMAD_ANALYSIS = "no";
    }

    fs.writeFileSync(configFilePath, yaml.dump(config), 'utf8');
    console.log(`Config file updated: INPUT=${containerInput}`);
  } catch (e) {
    console.error('Error while updating config file in container: ', e);
  }
}

// create a copy of the original container and add a volume with the input folder to analyze
export async function prepareSnakemakeCommand(containerName, userInput, snakefileDir) {
  try {
    const userConfigPath = path.join(snakefileDir, 'config.yaml');
    // const userConfigPath = appVariables.configFile;
    await updateConfigFile(userConfigPath);
    const newContainer = await mapIO(containerName, userInput, userConfigPath);

    console.log('Inspecting container...');
    const data = await newContainer.inspect();
    const volumes = data.Mounts;

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

async function mapIO(containerName, userInput, userConfigPath) {
  const snakemakeDir = path.dirname(userConfigPath);
  const userOutput = path.join(userInput, 'output');
  const containerSnakemakePath = ('/project/snakemake/');
  const amrfinderHost = path.join(path.join(snakemakeDir, "resources", "amrfinder"));
  const amrfinderVolume = '/opt/conda/envs/bacEnv/share/amrfinderplus';

  const container = docker.getContainer(containerName);

  if (!container) {
    throw new Error(`Container ${containerName} not found`);
  }

  console.log(`Working on: (name) ${containerName} container ${container}`);

  try {
    await stopContainer(containerName);
    
    const containerInfo = await container.inspect();

    // if (containerInfo.State.Status === 'running') {
    //   console.log(`Stopping container ${containerName}...`);
    //   await container.stop();
    //   console.log(`Container ${containerName} stopped.`);
    // }

    console.log(`Removing container ${containerName}...`);
    await container.remove();
    console.log(`Container ${containerName} removed.`);

    console.log(`Recreating container ${containerName} with updated volumes...`);
    try {
      await docker.createContainer({
        Image: containerInfo.Config.Image,
        name: containerName,
        Cmd: [
          '/bin/bash',
          '-c',
          `while true; do sleep 3650d; done`],
        Volumes: {
          [`${containerInput}`]: {},
          [`${containerOutput}`]: {},
          [`${containerSnakemakePath}`]: {},
        },
        HostConfig: {
          Binds: [
            `${userInput}:${containerInput}`,
            `${userOutput}:${containerOutput}`,
            `${snakemakeDir}:${containerSnakemakePath}`,
            `${amrfinderHost}:${amrfinderVolume}`,
          ],
        },
      });
    } catch (error) {
      console.error('Error while cloning container: ', error);
      throw ('Error while cloning container: ', error.message);
    }

    const newContainer = docker.getContainer(containerName);
    await newContainer.start();

    console.log('Container recreated and started with updated volumes.');
    return newContainer;

  } catch (error) {
    console.error('Error during dynamic binding of volumes: ', error);
    throw ('Error during dynamic binding of volumes: ', error.message);
  }
}

// run snakemake analysis and handle feedback
export async function runAnalysis(containerName, reply, onError) {
  const snakefileDir = '/project/snakemake';
  const containerConfigPath = '/project/snakemake/config.yaml';
  const container = docker.getContainer(containerName);
  const exec = await container.exec({
    Cmd: ['bash', '-c', `source /opt/conda/etc/profile.d/conda.sh && conda activate bacEnv && snakemake --jobs 1 --configfile ${containerConfigPath} --force all`],
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    WorkingDir: snakefileDir,
  });

  // handle feedback to send to frontend
  const stream = await exec.start({ hijack: true, stdin: true });
  await demuxStream(
    stream,
    (data) => {
      console.log(`Snakemake stdout: ${data}`);
      reply({ stdout: data.toString(), stderr: null });
    },
    (data) => {
      console.error(`Snakemake stderr: ${data}`);
      reply({ stdout: null, stderr: data.toString() });
    },
    () => {
      (async () => {
        const d = await exec.inspect();
        const code = (d) ? d.ExitCode : null;
        console.log(`Snakemake process exited with code ${code}`);
        if (code !== 0) {
          onError({ stdout: null, stderr: `Snakemake exited with code ${code}`, code: code });
        } else if (code === 0) {
          const endMessage = `Workflow completed: Snakemake exited with code ${code}`;
          console.error();
          reply({ stdout: null, stderr: endMessage });
        }
      })().catch(console.error);
    },
    async () => {
      const d = await exec.inspect();
      return !!(d && d.Running);
    }
  );
  return;
}

// produce the report and handle feedback

export async function produceReport(containerName, reply, onError, localConfigDir) {
  const localConfigPath = path.join(localConfigDir, 'config.yaml')
  const scriptDir = '/project/snakemake/scripts';
  const report = '/project/snakemake/scripts/report.Rmd';
  const config = yaml.load(fs.readFileSync(localConfigPath, 'utf8'), {});
  const analysisName = config.NAME;
  const identity = config.IDENTITY;
  const coverage = config.COVERAGE;
  const reportFile = `project/user-input/output/${analysisName}_report.html`;
  const container = docker.getContainer(containerName);

  const exec = await container.exec({
    Cmd: ['bash', '-c', `source /opt/conda/etc/profile.d/conda.sh && conda activate bacEnv && Rscript -e "rmarkdown::render('${report}', output_file='${reportFile}',
        output_dir = '${containerOutput}', params=list(path_output='${containerOutput}',
        identity=${identity}, coverage=${coverage}))"`],
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    WorkingDir: scriptDir,
  });

  // handle feedback to send to frontend
  const stream = await exec.start({ hijack: true, stdin: true });
  await demuxStream(
    stream,
    (data) => {
      console.log(`Report stdout: ${data}`);
      reply({ stdout: data.toString(), stderr: null });
    },
    (data) => {
      console.error(`Report stderr: ${data}`);
      reply({ stdout: null, stderr: data.toString() });
    },
    () => {
      (async () => {
        const d = await exec.inspect();
        const code = (d) ? d.ExitCode : null;
        console.log(`Report exited with code ${code}`);
        if (code !== 0) {
          onError({ stdout: null, stderr: `Report exited with code ${code}`, code: code });
        }
      })().catch(console.error);
    },
    async () => {
      const d = await exec.inspect();
      return !!(d && d.Running);
    }
  );
  return;
}