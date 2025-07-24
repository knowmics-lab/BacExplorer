# BacExplorer

Welcome to BacExplorer, a bacterial analysis tool with an user-friendly graphical interface.

![BACEXPLORER](https://github.com/user-attachments/assets/694f612f-8645-45bf-85c2-5ec00efdc1a6)


BacExplorer is a software system for the analysis of Microbial data. Its aim is to annotate Bacterial genome with information about Antimicrobial resistance, virulence factor, plasmids, serotypings and so on. The analysis is developed with Bash and wrapped in a Snakemake workflow.
BacExplorer permits to analyze both raw fastq and fasta data.

<img width="4472" height="2132" alt="BacExcplorer_Fig1" src="https://github.com/user-attachments/assets/16859cec-a620-4f4e-b6ac-0aa645c942ac" />



Please read the following guide for a correct installation and usage.

## SYSTEM REQUIREMENTS:
### Installation:
Internet connection is required to fetch the Docker image and external resources.

**LINUX USERS**: the package xdg-open is required. Make sure to install it with the following command:

```
sudo apt install xdg-utils
```

### Analysis:
It can be performed both with .fasta and .fastq files, with the following requirements:
- at least 36 GB of storage space;
- FASTA: at least 8 GB of RAM to analyze one sample;
- FASTQ: at least 8 GB of RAM to analyze one sample.

<br>**Tools requirements**:<br>
- Kraken2: at least 8 GB of RAM required. Otherwise, the workflow will skip Kraken;
- geNomad: the tool only works on x86 CPUs. It will be skipped on ARM architectures.

### Storage:
BacExplorer comes with a large amount of data due to the many databases of the softwares used for the analyses.
The whole app data is found in the following directories:
- **Linux Users**: /home/user/.config/BacExplorer
- **MacOS Users**: ~/Library/Application Support/BacExplorer
- **Windows Users**: C:\Users\user\AppData\Roaming\BacExplorer

## INSTALLATION
An UNIX environment is required to make Snakemake able to perform. To ensure this, the entire Snakemake pipeline runs into a Docker container, whether your OS is Linux, macOS or Windows Professional.
#### **Step 1 (OPTIONAL): Install Docker**
Docker is essential to run the application, so for the first usage you will be able to check whether Docker or Docker Desktop is already installed on your machine.
In case it is not, the link to Docker will be provided to you.
In case you still want to download it before getting started with the application itself, check the version for your platform here: https://www.docker.com/.
#### **Step 2: Download the tool**
Visit the following link and download the latest release: https://github.com/knowmics-lab/BacExplorer/releases. You will find the one that suits your OS in the **Assets** menu.
#### **Step 3: Run Docker and start BacExplorer**
Docker or Docker Desktop **must be running** throughout the whole usage of the application.
#### Step 4: Home page
You are now finished with the installation process and ready for your first analysis. Be sure to click on **Go to setup** if this is your first usage.
Read the following paragraph and let us guide you through all the steps.


![App setup](https://github.com/user-attachments/assets/eec116f4-2993-432f-854a-0fc53c3a7991)

## SETUP (FOR FIRST USAGE ONLY)
1) If you have not downloaded Docker yet, click on **Check**. If not found, the system will provide you the link to download the correct version for your platform.
2) Start Docker or Docker Desktop.
3) Run the **Environment Setup**. It will take some time to automatically set up the container and eventually run it. The entire process, which requires **no manual intervention**, consists of the following steps:
   - pull from Docker Hub (https://hub.docker.com/r/adrianacannata/bacexplorer) the image of the container;
   - download external resources. Databases will be stored in the app data directory, BacExplorer/snakemake/resources, and other tools will be stored in BacExplorer/snakemake/tools. Please **do not move any of these folders**, since they are mounted on the container as a volume;
   - create the container and start it;
   - update databases inside the container. 

![Docker setup](https://github.com/user-attachments/assets/3b5d3af5-a311-49d0-b590-f3d03b5292c6)

Once the Environment Setup is finished, you can move on to the analysis page.

**Please note that the procedure is necessary ONLY for your first usage of the application. In all the other cases, it is sufficient to click on START CONTAINER on the Home page and then navigate to the Analysis page.**

## USAGE
1) **Input**  
The user should put the input files in a specific folder, where the outputs are going to be saved.
  FASTQ file formats need to be either for single-end
- .fastq.gz
- .fq.gz

  <br> for paired-end
- _1.fastq.gz _2.fastq.gz
- _R1.fastq.gz _R2.fastq.gz
- _R1_L001.fastq.gz _R2_L001.fastq.gz
- _1.fq.gz _2.fq.gz
- _R1.fq.gz _R2.fq.gz
- _R1_L001.fq.gz _R2_L001.fq.gz

  <br> Fasta file extension should be
- .fasta
- .fa
- .fna
- .fsa


2) **Parameters Setting**  
The user needs to set the following parameters for the analysis:
- The **analysis name** (OPTIONAL), this will also be the name of the HTML report. If not provided, a default name will be assigned;
- If all the samples belong to the same **Genus** and **Species**, it is possible to specify them. In this case, the kraken2 taxonomy analysis will be skipped;
- **Identity** and **Coverage** values to filter AMR and virulence factor results. The default parameter is 90% for both;
- The **Technical Settings** consist of number of threads to set based on your PC specifics and the possibility to run geNomad analysis for the research of provirus in the samples under study.
- The **input folder** with the data to be analyzed.

<img width="2393" height="2132" alt="schermata_app1" src="https://github.com/user-attachments/assets/a2c21c0f-a808-44b0-9aa8-0d66221f4177" />



3) **Output organization**
<br> Inside the input folder the system will create an output folder with several subfolders and the html of the final report:
- abricate
- abricate_ecoli
- agrvate
- amrfinder
- ClermonTyping
- ectyper
- emmtyper
- fasta_output - *only in fastq analysis*
- file - *folder with files produced by the report*
- fimtyper
- genomad
- hicap
- kleborate
- kleborate_escherichia
- kraken2
- legsta
- lissero
- meningotype
- mlst
- ngmaster
- pasty
- pbptyper
- quality_assessment/fastqc - *only in fastq analysis*
- quality_assessment/quast
- sccmec
- shigatyper
- shigeifinder
- spatyper
- trim - *only in fastq analysis*
- virulencefinder
- Report.html


4) **Report page**


<img width="1555" height="1010" alt="immagine" src="https://github.com/user-attachments/assets/90f9f135-f5dc-401e-a372-6567474c4494" />



![immagine](https://github.com/user-attachments/assets/701aeba7-3081-4ab1-a0c7-279f349233b7)


![immagine](https://github.com/user-attachments/assets/5870e3ae-4b4e-4c1e-82a8-507f06436d45)



## Test

### FASTQ
To test BacExplorer with fastq samples it is possible to download:
- *Klebsiella pneumoniae* samples from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1125320 and from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1193841
- *Staphylococcus aureus* sample from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA912391

### FASTA
Fasta samples to test BacExplorer can be found in the "test_data" folder in this repository. The subfolder "case_study" contains the .fasta files analyzed in the case study.

## Softwares and Databases
# Softwares
- FastQC - https://github.com/s-andrews/FastQC
- QUAST - https://github.com/ablab/quast
- TrimGalore - https://github.com/FelixKrueger/TrimGalore
- SPAdes - https://github.com/ablab/spades
- Kraken2 - https://github.com/DerrickWood/kraken2
- MLST - https://github.com/tseemann/mlst
- ABRicate - https://github.com/tseemann/abricate
- AMRfinder+ - https://github.com/ncbi/amr
- VirulenceFinder - https://bitbucket.org/genomicepidemiology/virulencefinder/src/master/
- geNomad - https://portal.nersc.gov/genomad/
- Kleborate - https://github.com/klebgenomics/Kleborate
- ECTyper - https://github.com/phac-nml/ecoli_serotyping
- FimTyper - https://bitbucket.org/genomicepidemiology/fimtyper/src/master/
- ClermonTyping - https://github.com/A-BN/ClermonTyping
- AgrVATE - https://github.com/VishnuRaghuram94/AgrVATE
- sscmec - https://github.com/rpetit3/sccmec
- spaTyper - https://github.com/HCGB-IGTP/spaTyper
- emmtyper - https://github.com/MDU-PHL/emmtyper
- pbptyper - https://github.com/rpetit3/pbptyper
- ShigaTyper - https://github.com/CFSAN-Biostatistics/shigatyper
- ShigEiFinder - https://github.com/LanLab/ShigEiFinder
- hicap -https://github.com/scwatts/hicap
- legsta - https://github.com/tseemann/legsta
- LisSero - https://github.com/MDU-PHL/LisSero
- meningotype - https://github.com/MDU-PHL/meningotype
- ngmaster - https://github.com/MDU-PHL/ngmaster
- pasty - https://github.com/rpetit3/pasty


# Databases
- CARD - https://card.mcmaster.ca/
- Megares - https://db.meglab.org/
- Arg-annot - https://www.mediterranee-infection.com/acces-ressources/base-de-donnees/arg-annot-2/
- VFDB - https://www.mgc.ac.cn/VFs/main.htm
- PlasmidFinder - https://bitbucket.org/genomicepidemiology/plasmidfinder_db/src/master/
- PubMLST - https://pubmlst.org/
  
## Citation 
- BacExplorer - Privitera GF, Cannata AA, Campanile F, Alaimo S, Bongiorno D, Pulvirenti A. BacExplorer (2025). Available at [https://github.com/knowmics-lab/BacExplorer](https://github.com/knowmics-lab/BacExplorer)


