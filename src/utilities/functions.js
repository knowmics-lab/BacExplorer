// utils to check Docker installation

import { exec, execSync } from "child_process";
import os from "os";

export function checkDockerInstalled() {
    try {
      execSync("docker --version", { stdio: "ignore" });
      const response = "Docker is installed";
      console.log(response);
      return response;
    } catch (error) {
      console.log("Docker is not installed.");
      const platform = os.platform();

      if(platform === "linux" || platform === "win32" || platform === "darwin")
        return "Docker not found: please install";
      else
        return "System not supported for Docker installation";
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