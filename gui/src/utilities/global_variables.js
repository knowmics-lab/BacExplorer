import { app } from "electron";
import path from 'path';

export const userVariables = {
    originalConfigInput: "",
    userAnalysisName: "",
}
// imageName: 'adrianacannata/bacexplorer:latest',
export const containerVariables = {
    // imageName: 'ghcr.io/knowmics-lab/bacexplorer:1.0',
    imageName: 'adrianacannata/bacexplorer:latest',
    containerName: 'snakemakeContainer',
    containerInput: "/project/user-input/",
    containerOutput: "/project/user-input/output/",
}

// use the userData path as the backend path to mount it as a volume on the container
const backendPath = path.join(app.getPath('userData'), 'snakemake');
const configFile = path.join(backendPath, 'config.yaml');
export const appVariables = {
    backendPath,
    configFile,
}

export const flags = {
    outputExists: false,
}