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
    cpanminus \
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

# change row 34 from rU to r in ngmaster
RUN sed -i '34s/rU/r/' \
    /opt/conda/envs/bacEnv/lib/python3.12/site-packages/ngmaster/utils.py

# Install other packages
RUN echo "Installing packages..." && \
    echo "RGI" && \
    pip install git+https://github.com/arpcard/rgi.git && \
    echo "sccmec" && \
    git clone --recurse-submodules https://github.com/rpetit3/sccmec && \
    echo "fimtyper" && \
    git clone https://bitbucket.org/genomicepidemiology/fimtyper.git && \
    cd fimtyper && \
    git clone https://bitbucket.org/genomicepidemiology/fimtyper_db.git && \
    make install && \
    echo "ClermonTyping" && \
    git clone https://github.com/happykhan/ClermonTyping.git && \
    echo "metaMLST" && \
    git clone --recurse-submodules https://github.com/SegataLab/metamlst.git && \
    echo "usearch" && \
    curl 'https://www.drive5.com/downloads/usearch11.0.667_i86linux32.gz' --output usearch11.0.667_i86linux32.gz && \
    gunzip usearch11.0.667_i86linux32.gz && \
    chmod 755 usearch11.0.667_i86linux32 && \
    echo "R packages" && \
    Rscript -e "install.packages(c('stringr', 'downloadthis', 'DT', 'openxlsx'), repos='https://cran.r-project.org/'); \
    if (!require('BiocManager', quietly = TRUE)) install.packages('BiocManager', repos='https://cran.r-project.org/'); \
    BiocManager::install('ComplexHeatmap'); \
    quit(save='no')"

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

# to build Docker image, run the following in your terminal:
# docker build -t bacexplorer .

# for distribution:
# docker save -o bacexplorer.tar bacexplorer

# for loading:
# docker load -i bacexplorer.tar