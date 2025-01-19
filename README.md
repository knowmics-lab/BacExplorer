# BacExplorer

Welcome to BacExplorer, a bacterial analysis tool with an user-friendly GUI.

This tool performs bacterial analysis with the following softwares:
...list softwares.

The analysis is developed with the workflow management system Snakemake.

Please reade the following guide for a correct installation and usage.

## SYSTEM REQUIREMENTS:
### Installation:
Internet connection needed to fetch the Docker image and external resources.
...
%Inserire qui link download eseguibili
Windows
Mac 
Linux

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
Please ensure to run Docker before you start setting the environment, otherwise the app will not be able to run.


![immagine](https://github.com/user-attachments/assets/80b90d15-599f-4321-bda5-a6685b1445ad)



## USAGE
1) Inputs
2) Output organization
3) Parameters setting

-- SCREENSHOT DEL SETTING DEI PARAMETRI --

4) Report page


![immagine](https://github.com/user-attachments/assets/db3fe1ee-f254-4bad-8fe4-f05975e0bec6)


![immagine](https://github.com/user-attachments/assets/701aeba7-3081-4ab1-a0c7-279f349233b7)


![immagine](https://github.com/user-attachments/assets/5870e3ae-4b4e-4c1e-82a8-507f06436d45)




## Test

### FASTQ
To test BacExplorer with fastq samples it is possible to donwload:
- *Klebsiella pnaumoniae* samples from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1125320 and from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1193841
- *Staphylococcus aureus* sample from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA912391

### FASTA
Fasta samples to test BacExplorer can be found in "test_data" folder in this repository.

## Software and Database
- ABRicate - https://github.com/tseemann/abricate
- AMRfinder+ - https://github.com/ncbi/amr
- MLST - https://github.com/tseemann/mlst
- VirulenceFinder - https://bitbucket.org/genomicepidemiology/virulencefinder/src/master/
- Kleborate - https://github.com/klebgenomics/Kleborate
- ECTyper - https://github.com/phac-nml/ecoli_serotyping
- AgrVATE - https://github.com/VishnuRaghuram94/AgrVATE
- sscmec - https://github.com/rpetit3/sccmec
- spaTyper - https://github.com/HCGB-IGTP/spaTyper
- emmtyper - https://github.com/MDU-PHL/emmtyper
- pbptyper - https://github.com/rpetit3/pbptyper
- ShigaTyper - https://github.com/CFSAN-Biostatistics/shigatyper
- hicap -https://github.com/scwatts/hicap
- LisSero - https://github.com/MDU-PHL/LisSero

- CARD - https://card.mcmaster.ca/
- Megares - https://db.meglab.org/
- Arg-annot
- VFDB - https://www.mgc.ac.cn/VFs/main.htm
- PlasmidFinder - https://bitbucket.org/genomicepidemiology/plasmidfinder_db/src/master/
- 
## Citation 
- BacExplorer


