from snakemake import shell

# PATH SCRIPT = bacExplorer/snakemake
# structure = snakemake/scripts/
#                              |- report.Rmd
#                              |- TrimGalore | sccmec | ecc.

FASTQ_DIR = os.path.join(PATH_PROJECT, "fastq")
PATH_TRIMGALORE = os.path.join(PATH_SCRIPT, "scripts/TrimGalore-master")

for file in os.listdir(PATH_PROJECT):
    if file.endswith(".gz"):
        source_path = os.path.join(PATH_PROJECT, file)
        destination_path = os.path.join(FASTQ_DIR, file)
        shutil.move(source_path, destination_path)

print("FASTQ_DIR: ", FASTQ_DIR)

ALL_BASENAMES = [
    os.path.basename(f).replace("fq", "fastq")
    for f in glob.glob(f"{FASTQ_DIR}/*.gz")
]

for s in ALL_BASENAMES:
    print(s)

#non paired: sample.fq.gz
#paired: sample_R1_001.fastq.gz

FASTQ_PAIRED = [
    f.replace("_R1_001.fastq.gz", "")
    for f in ALL_BASENAMES if "_R1_001" in f
]

FASTQ_SINGLE = [
    f.replace(".fastq.gz", "")
    for f in ALL_BASENAMES if "R1_001" not in f and "R2_001" not in f
]

FASTQ_SAMPLES = FASTQ_PAIRED + FASTQ_SINGLE

PATH_TRIM = os.path.join(PATH_OUTPUT, "trim")
paired = config["PAIRED"]

print(f"FASTQ_SINGLE: {FASTQ_SINGLE}")
print(f"FASTQ_PAIRED: {FASTQ_PAIRED}")
print(f"FASTQ_SAMPLES: {FASTQ_SAMPLES}")

print(f"Trim Galore path: {PATH_TRIMGALORE}")

def trim_galore():
    for sample in FASTQ_SAMPLES:  
        fasta_file = os.path.join(PATH_PROJECT, f"{sample}.fasta")
        shell(f"""
        chmod +x {PATH_TRIMGALORE}/trim_galore
        """)

        if paired == "yes":
            sample_f="{FASTQ_DIR}/{sample}_R1_001.fastq.gz"
            sample_r="{FASTQ_DIR}/{sample}_R2_001.fastq.gz"
            spades_sample_f="{PATH_TRIM}/{sample}_R1_001_val_1.fq.gz"
            spades_sample_r="{PATH_TRIM}/{sample}_R2_001_val_2.fq.gz"
            print("Performing Trim Galore")
            shell(f"""
            {PATH_TRIMGALORE}/trim_galore --paired -o {PATH_TRIM} {sample_f} {sample_r} -j 2
            echo "SPADES"
            spades.py -1 {spades_sample_f} -2 {spades_sample_r} -t 2 -o {PATH_PROJECT}
            """)
        else:
            sample_s="{sample}.fastq.gz"
            spades_sample_s="{sample}_trimmed.fq.gz"
            shell(f"""
            {PATH_TRIMGALORE}/trim_galore -o {PATH_TRIM} {sample_s} -j 2
            spades.py -s {spades_sample_s} -t 2 -o {PATH_PROJECT}
            """)
        shell(f"""
        mv {PATH_PROJECT}/contigs.fasta {fasta_file}
        mkdir -p {PATH_PROJECT}/fasta_output
        mv {PATH_PROJECT}/{sample}.fasta {PATH_PROJECT}/fasta_output
        """)

trim_galore()