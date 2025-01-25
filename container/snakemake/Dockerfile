FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
    wget \
    curl \
    git \
    build-essential \
    python3-pip \
    python3-dev \
    r-base \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    unzip \
    && apt-get clean

RUN curl -L https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o miniconda.sh && \
    bash miniconda.sh -b -u -p /opt/conda && \
    rm miniconda.sh
    # source ~/miniconda3/bin/activate

ENV PATH=/opt/conda/bin:$PATH

RUN echo "Creating conda environment..." && \
    conda config --add channels bioconda && \
    conda config --add channels conda-forge && \
    conda config --set channel_priority flexible

COPY bacEnv.yml /tmp/

RUN conda env create -f /tmp/bacEnv.yml

COPY . /project

WORKDIR /project

# Activate conda env
SHELL ["conda", "run", "-n", "bacEnv", "/bin/bash", "-c"]

RUN mkdir -p scripts

WORKDIR /project/scripts

# Install other packages
RUN echo "Installing packages..." && \
    echo "sccmec" && \
    git clone --recurse-submodules https://github.com/rpetit3/sccmec && \
    echo "trim-galore" && \
    curl -L https://github.com/FelixKrueger/TrimGalore/archive/refs/heads/master.zip -o master.zip && \
    unzip master.zip && \
    rm master.zip && \
    echo "metaMLST" && \
    git clone --recurse-submodules https://github.com/SegataLab/metamlst.git && \
    echo "usearch" && \
    curl 'https://www.drive5.com/downloads/usearch11.0.667_i86linux32.gz' --output usearch11.0.667_i86linux32.gz && \
    gunzip usearch11.0.667_i86linux32.gz && \
    chmod 755 usearch11.0.667_i86linux32 && \
    echo "R packages" && \
    Rscript -e 'install.packages("openxlsx", repos="https://cran.r-project.org/"); \
                install.packages("DT", repos="https://cran.r-project.org/"); \
                quit(save="no")'

WORKDIR /project

# Update databases
# RUN echo "Updating DBs..." && \
#     echo "AMRfinder" && \
#     amrfinder -u && \
#     abricate-get_db --db card --force && \
#     abricate-get_db --db argannot --force && \
#     abricate-get_db --db resfinder --force && \
#     abricate-get_db --db ecoh --force && \
#     abricate-get_db --db vfdb --force && \
#     abricate-get_db --db plasmidfinder --force && \
#     abricate-get_db --db ecoli_vf --force &&
    # abricate-get_db --db megares --force && \
    # abricate-get_db --db ncbi --force && \
# RUN echo "MLST" && \
#     env_path=$(conda info --envs | grep '* ' | cut -d ' ' -f 2) && \
#     if [ -z "$env_path" ]; then \
#         echo "Conda environment doesn't exist"; \
#         exit 1; \
#     fi && \
#     pubmlst_path="$env_path"/pubmlst && \
#     mlst-download_pub_mlst -d $pubmlst_path && \
#     mlst-make_blast_db &&

# RUN mkdir -p resources

# WORKDIR /project/resources

# RUN echo "Kraken2" && \
#     curl -L https://genome-idx.s3.amazonaws.com/kraken/k2_standard_08gb_20240904.tar.gz -o k2_standard_08gb_20240904.tar.gz && \
#     tar -xvzf k2_standard_08gb_20240904.tar.gz &&
# RUN echo "Virulence_finder" && \
#     git clone https://bitbucket.org/genomicepidemiology/virulencefinder_db/

# to build Docker image, run the following in your terminal:
# docker build -t bacexplorer .

# for distribution:
# docker save -o bacexplorer.tar bacexplorer

# for loading:
# docker load -i bacexplorer.tar