#------------------------------------------------------------------------------------------------------------------------#
#BacExplorer v2

#Snippy - già installato
#Snippy - funzionamento
#fastq
snippy --cpus 2 --outdir snps_40_S11_HE_gbk_fastq --ref HE574483.gbk --R1 40_S11_L001_R1_001.fastq.gz --R2 40_S11_L001_R2_001.fastq.gz
#fasta
snippy --cpus 2 --outdir snps_40_S11_HE_gbk --ref HE574483.gbk --ctgs 40_S11.fasta
#il gbk deve essere quello full!

#Fimtyper per escherichia
#Se non funziona, fare come con TrimGalore e inserirlo nei Tools

#per far funzionare make install, inserire nel docker file:

sudo apt update
sudo apt install cpanminus

#Scaricamento
git clone https://bitbucket.org/genomicepidemiology/fimtyper.git
cd fimtyper
git clone https://bitbucket.org/genomicepidemiology/fimtyper_db.git
make install #ok su bacEnv
conda install bioconda::perl-try-tiny-retry #ok su bacEnv
#utilizzo
cd fimtyper
perl fimtyper.pl -d fimtyper_db/ -b /data/miniforge3/envs/bacEnv1 -i $PATH_INPUT/test.fsa -k 95.00 -l 0.60 -o $PATH_OUTPUT
mv result_tab > fasta_name_tab

#ngmaster
#installazione
conda install -c bioconda ngmaster=0.5.8  #ok su bacEnv
#modifica linea 34 da rU a r del seguente file

/data/miniforge3/envs/bacEnv1/lib/python3.12/site-packages/ngmaster/utils.py
#utilizzo
ngmaster ngmaster/ERR14162259.fasta > ngmaster/ERR_res.txt


#ShigEiFinder 
#installazione
conda install -c conda-forge -c bioconda shigeifinder #ok su bacEnv
#utilizzo
shigeifinder -t 1 -i ERR1000679.fasta > ERR1000679_shigheifinder.txt

#Pasty
#installazione
conda install -c bioconda -c conda-forge pasty=2.2.1 #ok su bacEnv
#utilizzo
camlhmp-blast-regions --input O1-GCF_001420225.fna --outdir ./ --prefix 01-GCF_001420225 -y /data/miniforge3/envs/bacEnv1/bin/../share/pasty/pa-osa.yaml -t /data/miniforge3/envs/bacEnv1/bin/../share/pasty/pa-osa.fasta

#ClermonTyping
#installazione
git clone https://github.com/happykhan/ClermonTyping.git

#cartella: bacEnv/ClermonTyping
#utilizzo
#posizionarsi nella cartella di clermontyping o richiamarlo da lì
./clermonTyping.sh --fasta /data/software_batteri/ecoli_prova.fasta

#meningotype
#installazione
# pip install --user git+https://github.com/MDU-PHL/meningotype.git #ok su bacEnv
conda install -c bioconda meningotype
#/root/.local/bin/meningotype
#utilizzo
/root/.local/bin/meningotype --all A.fna > A_meningotype.txt
