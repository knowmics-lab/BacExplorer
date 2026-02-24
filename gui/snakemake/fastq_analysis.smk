from snakemake import shell

PATH_TRIMGALORE = os.path.join(PATH_SCRIPT, "tools/TrimGalore-master")

FASTQ_DIR = os.path.join(PATH_PROJECT, "fastq")

# for file in os.listdir(PATH_PROJECT):
#     if file.endswith(".gz"):
#         source_path = os.path.join(PATH_PROJECT, file)
#         destination_path = os.path.join(FASTQ_DIR, file)
#         shutil.move(source_path, destination_path)

# print("FASTQ_DIR: ", FASTQ_DIR)

ALL_BASENAMES = [
    os.path.basename(f).replace("fq", "fastq")
    for f in glob.glob(f"{FASTQ_DIR}/*.gz")
]

for s in ALL_BASENAMES:
    print(s)

# unpaired: sample.fq.gz
# paired: sample_R1_001.fastq.gz sample_R2_001.fastq.gz, R1.fastq.gz R2.fastq.gz, nome_1.fastq.gz nome_2.fastq.gz

FASTQ_PAIRED = [
    f.replace("_R1_001.fastq.gz", "")
    for f in ALL_BASENAMES if "_R1_001" in f
]

FASTQ_SINGLE = [
    f.replace(".fastq.gz", "")
    for f in ALL_BASENAMES if "R1_001" not in f and "R2_001" not in f
]

FASTQ_SAMPLES = FASTQ_PAIRED + FASTQ_SINGLE

print(f"FASTQ_SINGLE: {FASTQ_SINGLE}")
print(f"FASTQ_PAIRED: {FASTQ_PAIRED}")
print(f"FASTQ_SAMPLES: {FASTQ_SAMPLES}")

PATH_TRIM = os.path.join(PATH_OUTPUT, "trim")

print(f"FASTQ ANALYSIS STARTED")

print(f"Trim Galore path: {PATH_TRIMGALORE}")

def trim_galore():
    # testare la percentuale nel progress (in runAnalysis, containers.js)
    sys.stderr.write("Fastq analysis started:(1%)\n")
    sys.stderr.flush()

    for sample in FASTQ_SAMPLES:
        print(f"Performing Trim Galore on: {sample}")
        fasta_file = os.path.join(PATH_PROJECT, f"{sample}.fasta")
        
        fasta_processed = os.path.join(FASTA_SAMPLES_DIR, f"{sample}.fasta")
        if os.path.exists(fasta_processed):
            print(f"Sample {sample} already processed, skipping...")
            continue
        
        shell(f"""
        chmod +x {PATH_TRIMGALORE}/trim_galore
        """)
        
        if paired == "yes":
            sample_f = os.path.join(FASTQ_DIR, f"{sample}_R1_001.fastq.gz")
            sample_r = os.path.join(FASTQ_DIR, f"{sample}_R2_001.fastq.gz")
            spades_sample_f = os.path.join(PATH_TRIM, f"{sample}_R1_001_val_1.fq.gz")
            spades_sample_r = os.path.join(PATH_TRIM, f"{sample}_R2_001_val_2.fq.gz")
            
            shell(f"""
            {PATH_TRIMGALORE}/trim_galore --paired -o {PATH_TRIM} {sample_f} {sample_r} -j {THREADS_NUMBER}
            spades.py -1 {spades_sample_f} -2 {spades_sample_r} -t {THREADS_NUMBER} -o {PATH_PROJECT}
            """)
        else:
            sample_s = os.path.join(FASTQ_DIR, f"{sample}.fastq.gz")
            spades_sample_s = os.path.join(PATH_TRIM, f"{sample}_trimmed.fq.gz")
            
            shell(f"""
            {PATH_TRIMGALORE}/trim_galore -o {PATH_TRIM} {sample_s} -j {THREADS_NUMBER}
            spades.py -s {spades_sample_s} -t {THREADS_NUMBER} -o {PATH_PROJECT}
            """)
        
        shell(f"""
        mv {PATH_PROJECT}/contigs.fasta {fasta_file}
        mkdir -p {FASTA_SAMPLES_DIR}
        mv {fasta_file} {FASTA_SAMPLES_DIR}
        """)

print(f"FASTQ_SAMPLES: {FASTQ_SAMPLES}")

ALL_FASTA_FILES = [
    os.path.join(FASTA_SAMPLES_DIR, f"{sample}.fasta")
    for sample in FASTQ_SAMPLES
]

if all(os.path.exists(f) for f in ALL_FASTA_FILES):
    print("Trimming already performed for all samples.")
else:
    trim_galore()