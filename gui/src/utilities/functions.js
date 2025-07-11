// utils to check Docker installation

import { exec, execSync } from 'child_process';
import os                 from 'os';
import Docker             from 'dockerode';

async function connectToDocker () {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let docker;
    if (platform === 'win32') {
      docker = new Docker({ socketPath: '//./pipe/docker_engine' });
    } else if (platform === 'linux' || process.platform === 'darwin') {
      docker = new Docker({ socketPath: '/var/run/docker.sock' });
    } else {
      reject('Unsupported platform: ', process.platform);
    }
    docker.ping((err, data) => {
      if (err) {
        reject('Docker connection failed: ', err);
      } else {
        resolve();
      }
    });
  });
}

export async function checkDockerInstalled () {
  try {
    await connectToDocker();
    // execSync("docker --version", { stdio: "ignore" });
    const response = 'Docker is installed';
    console.log(response);
    return response;
  } catch (error) {
    console.log('Docker is not installed.');
    console.error(error);
    const platform = os.platform();

    if (platform === 'linux' || platform === 'win32' || platform === 'darwin')
      return `Docker not found: please install. Error: ${error}`;
    else
      return 'System not supported for Docker installation';
  }
}

export async function checkDockerRunning () {
  await connectToDocker();
  // return new Promise((resolve, reject) => {
  //     exec("docker info", (error, stdout, stderr) => {
  //         if (error) {
  //             reject("Docker is not running.");
  //         } else {
  //             resolve("Docker is running.");
  //         }
  //     });
  // });
}