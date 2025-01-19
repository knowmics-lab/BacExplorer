# BacExplorer

Welcome to BacExplorer, a bacterial analysis tool with an user-friendly GUI.

This tool performs bacterial analysis with the following softwares:
...list softwares.

The analysis is developed with the workflow management system Snakemake.

Please reade the following guide for a correct installation.

## SYSTEM REQUIREMENTS:
### Installation:
Internet connection needed to fetch the Docker image and external resources.
...

### Analysis:
It can be performed both with .fasta and .fastq files, with the following requirements:
FASTA: ...
FASTQ: ...

## INSTALLATION
A UNIX environment is required so that Snakemake will be able to perform.
This is ensured with the usage of Docker, so tool can be executed on Linux, macOS and Windows.
If your system doesn't have Docker, please install it for your platform from here: https://www.docker.com/.
You can decide to install Docker later, since we provide the download link for your platform inside the application too.
The installation of Docker is the only manual step for the usage of BacExplorer: everything else is automatized.
Please ensure to run Docker before you start setting the environment, otherwise it won't be able to do it correctly.

-- SCREENSHOT DELLA GUIDA --

## USAGE
1) Inputs
2) Output organization
3) Parameters setting

-- SCREENSHOT DEL SETTING DEI PARAMETRI --

4) Report page

### Test

## FASTQ
To test BacExplorer with fastq samples it is possible to donwload:
*Klebsiella pnaumoniae* samples from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1125320 and from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1193841
*Staphylococcus aureus* sample from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA912391

## FASTA
Fasta samples to test BacExplorer can be found in "test_data" folder in this repository.
