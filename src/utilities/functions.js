// utils to check Docker installation

import { exec, execSync } from "child_process";
import os from "os";

export function checkDockerInstalled() {
  try {
    execSync ("docker --version", { stdio: "ignore" });
    const response = "Docker is installed";
    console.log(response);
    return(response);
  } catch (error) {
    console.log("Docker is not installed.");

    const platform = os.platform();

    try {
        if (platform === "linux") {
            console.log("System: Linux.");
            const dockerLink = "https://docs.docker.com/engine/install/ubuntu/";
            return(dockerLink);
        } else if (platform === "darwin") {
            console.log("System: macOS.");
            const dockerLink = "https://docs.docker.com/desktop/setup/install/mac-install/";
            return(dockerLink);
        } else if (platform === "win32") {
            console.log("System: Windows.");
            const dockerLink = "https://docs.docker.com/desktop/setup/install/windows-install/";
            return(dockerLink);
        } else {
            console.error("System not supported.");
        }
    } catch (installError) {
        console.error("Errore during Docker installation:", installError.message);
    }
  }
}

export function checkDockerRunning() {
    return new Promise((resolve, reject) => {
        exec("docker info", (error, stdout, stderr) => {
            if (error) {
                reject("Docker is not running.");
            } else {
                resolve("Docker is running.");
            }
        });
    });
}