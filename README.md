# BacExplorer

Welcome to BacExplorer, a bacterial analysis tool with an user-friendly GUI.

![BACEXPLORER](https://github.com/user-attachments/assets/694f612f-8645-45bf-85c2-5ec00efdc1a6)


BacExplorer is a software system for the analysis of Microbial data. Its aim is to annotate Bacterial genome with information about Antimicrobial resistance, virulence factor, plasmids, serotypings and so on. The analysis is developed with the workflow management system Snakemake.
BacExplorer permits to analyze both raw fastq data and fasta.

![immagine](https://github.com/user-attachments/assets/519c9191-a3cd-4836-af01-e474be6bf8c9)


Please read the following guide for a correct installation and usage.

## SYSTEM REQUIREMENTS:
### Installation:
Internet connection is required to fetch the Docker image and external resources.
...
%Inserire qui link download eseguibili
Windows
Mac 
Linux

LINUX USERS: the package xdg-open is required. Make sure to install it with sudo apt install xdg-utils.

### Analysis:
It can be performed both with .fasta and .fastq files, with the following requirements:
- at least 25 GB of storage space;
- FASTA: at least 8 GB of RAM to analyze one sample;
- FASTQ: at least 8 GB of RAM to analyze one sample;


## INSTALLATION
An UNIX environment is required so that Snakemake will be able to perform. This is ensured with the usage of Docker, so the tool can be executed on Linux, macOS and Windows.
If your system doesn't have Docker, please install it for your platform from here: https://www.docker.com/.
You can decide to install Docker later, since we provide the download link for your platform inside the application too.
The installation of Docker is the only manual step for the usage of BacExplorer: everything else is automatized.
**Please ensure to run Docker before you start setting the environment, otherwise the app will not be able to run.**

![App setup](https://github.com/user-attachments/assets/eec116f4-2993-432f-854a-0fc53c3a7991)

## SETUP
1) Check if Docker is installed, otherwise download the version for your platform.
2) Start Docker or Docker Desktop.
3) Run the **Environment Setup** to setup the container and run it.

![Docker setup](https://github.com/user-attachments/assets/3b5d3af5-a311-49d0-b590-f3d03b5292c6)

## USAGE
1) **Input**  
The user should put his input files in a specific folder, where the outputs are going to be saved. FASTQ file formats need to be either .fastq.gz or .fq.gz.
Fasta file extension should be .fasta.
2) **Parameters setting**  
The user needs to set the following parameters for the analysis:
- The analysis name, this will also be the name of the HTML report;
- If all the samples belongs to the same Genus and Species, it is possible to specify them and the kraken2 taxonomy analysis will be skipped.
- Identity and Coverage value for the filtering of AMR and virulence factor results. Default parameter is 90% for both.
- The folder with the data to be analyzed.

![Parameters_setting](https://github.com/user-attachments/assets/0865b1fb-63ce-41b7-b792-509d1f853410)

3) Output organization
Inside the input folder the system will create an output folder with several subfolders:
- abricate
- abricate_ecoli
- agrvate
- amrfinder
- ectyper
- emmtyper
- fasta - *only in fastq analysis*
- file
- hicap
- kleborate
- kleborate_escherichia
- kraken2
- legsta
- lissero
- mlst
- pbptyper
- sccmec
- shigatyper
- spatyper
- trim - *only in fastq analysis*
- virulencefinder
- Report.html



4) Report page


![immagine](https://github.com/user-attachments/assets/db3fe1ee-f254-4bad-8fe4-f05975e0bec6)


![immagine](https://github.com/user-attachments/assets/701aeba7-3081-4ab1-a0c7-279f349233b7)


![immagine](https://github.com/user-attachments/assets/5870e3ae-4b4e-4c1e-82a8-507f06436d45)




## Test

### FASTQ
To test BacExplorer with fastq samples it is possible to download:
- *Klebsiella pnaumoniae* samples from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1125320 and from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA1193841
- *Staphylococcus aureus* sample from https://www.ncbi.nlm.nih.gov/bioproject/PRJNA912391

### FASTA
Fasta samples to test BacExplorer can be found in "test_data" folder in this repository.

## Software and Database
# Software
- TrimGalore - https://github.com/FelixKrueger/TrimGalore
- SPAdes - https://github.com/ablab/spades
- Kraken2 - https://github.com/DerrickWood/kraken2
- MLST - https://github.com/tseemann/mlst
- ABRicate - https://github.com/tseemann/abricate
- AMRfinder+ - https://github.com/ncbi/amr
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
- legsta - https://github.com/tseemann/legsta
- LisSero - https://github.com/MDU-PHL/LisSero
# Database
- CARD - https://card.mcmaster.ca/
- Megares - https://db.meglab.org/
- Arg-annot - https://www.mediterranee-infection.com/acces-ressources/base-de-donnees/arg-annot-2/
- VFDB - https://www.mgc.ac.cn/VFs/main.htm
- PlasmidFinder - https://bitbucket.org/genomicepidemiology/plasmidfinder_db/src/master/
- PubMLST - https://pubmlst.org/
  
## Citation 
- BacExplorer - Privitera GF, Cannata AA, Campanile F, Alaimo S, Bongiorno D, Pulvirenti A. BacExplorer (2025). Available at [https://github.com/gretep/BacExplorer](https://github.com/AdrianaCannata/BacExplorer)


