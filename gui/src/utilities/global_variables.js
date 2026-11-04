import { app } from "electron";
import path from 'path';

export const userVariables = {
    originalConfigInput: "",
    userAnalysisName: "",
}
export const containerVariables = {
    //imageName: 'ghcr.io/knowmics-lab/bacexplorer:1.1',
    imageName: 'adrianacannata/bacexplorer:latest',
    containerName: 'snakemakeContainer',
    containerInput: "/project/user-input/",
    containerOutput: "/project/user-input/output/",
    containerResources: "/project/snakemake/resources/",
    containerTools: "/project/snakemake/tools/",
    dbsVolume: "/opt/conda/envs/bacEnv/db/",
    amrfinderVolume: "/opt/conda/envs/baktaEnv/share/amrfinderplus/data/2026-10-29.1",
}

// use the userData path as the backend path to mount it as a volume on the container
const snakemakePath = path.join(app.getPath('userData'), 'snakemake');
const configFile = path.join(snakemakePath, 'config.yaml');
export const appVariables = {
    snakemakePath,
    configFile,
}

export const flags = {
    outputExists: false,
}