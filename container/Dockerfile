FROM ubuntu:22.04
LABEL org.opencontainers.image.source=https://github.com/knowmics-lab/BacExplorer
LABEL org.opencontainers.image.description="BacExplorer Main Container"
LABEL org.opencontainers.image.licenses=MIT

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y \
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

ENV PATH=/opt/conda/bin:$PATH

RUN echo "Creating conda environment..." && \
    conda config --add channels bioconda && \
    conda config --add channels conda-forge && \
    conda config --set channel_priority flexible

COPY bacEnv.yml /tmp/

RUN conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/main && \
    conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/r && \
    conda env create -f /tmp/bacEnv.yml

# Activate conda env
SHELL ["conda", "run", "-n", "bacEnv", "/bin/bash", "-c"]

# --------------------------------------------------------
# Install AMRFinderPlus 4.2.5 inside bacEnv
# --------------------------------------------------------

RUN conda install -c conda-forge patchelf -y && \
    mkdir -p /project/tools/amrfinder && \
    cd /project/tools/amrfinder && \
    wget https://github.com/ncbi/amr/releases/download/amrfinder_v4.2.5/amrfinder_binaries_v4.2.5.tar.gz && \
    tar -xzf amrfinder_binaries_v4.2.5.tar.gz && \
    rm amrfinder_binaries_v4.2.5.tar.gz && \
    for bin in $(find . -type f -executable); do \
        file "$bin" | grep -q "ELF" && patchelf --set-rpath "$CONDA_PREFIX/lib" "$bin"; \
    done && \
    ./amrfinder --force_update

# 4) Update AMRfinder database
RUN /project/tools/amrfinder/amrfinder --force_update || true

ENV PATH="/project/tools/amrfinder:$PATH"

COPY . /project

# change row 34 from rU to r in ngmaster
RUN sed -i '34s/rU/r/' \
    /opt/conda/envs/bacEnv/lib/python3.12/site-packages/ngmaster/utils.py

# install packages in the following directory
WORKDIR /project/tools

# Install other packages
RUN echo "Installing packages..." && \
    echo "RGI" && \
    pip install git+https://github.com/arpcard/rgi.git && \
    echo "hicap" && \
    git clone https://github.com/scwatts/hicap.git && \
    echo "reportlab" && \
    pip install reportlab && \
    echo "AMRfinder" && \

    echo "sccmec" && \
    git clone --recurse-submodules https://github.com/rpetit3/sccmec && \
    echo "fimtyper" && \
    git clone https://bitbucket.org/genomicepidemiology/fimtyper.git && \
    cd fimtyper && \
    git clone https://bitbucket.org/genomicepidemiology/fimtyper_db.git && \
    make install && \
    cd .. && \
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

# to build Docker image, run the following in your terminal:
# docker build -t bacexplorer .

# for distribution:
# docker save -o bacexplorer.tar bacexplorer

# for loading:
# docker load -i bacexplorer.tar
