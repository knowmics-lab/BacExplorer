# from snakemake import shell
# import os

# PATH_OUTPUT = os.environ["PATH_OUTPUT"]
# PATH_PROJECT = os.environ["PATH_PROJECT"]
# SAMPLES = os.environ["SAMPLES"]
# THREADS_NUMBER = os.environ["THREADS_NUMBER"]

print("Performing quality check...")

PATH_QUAST = os.path.join(PATH_OUTPUT, "quast_results")

rule quality_check:
    input:
        fasta_file = os.path.join(PATH_PROJECT, "{sample}.fasta")
    output:
        quast = os.path.join(PATH_OUTPUT, "quast_results/{sample}")
    run:
        # if type == "fasta":
        #     shell(f"""
        #     quast.py {wildcards.sample} -o {PATH_QUAST} -t {THREADS_NUMBER}
        #     # mv report.tsv > {wildcards.sample}_report.tsv
        #     """)
        # elif type == "fastq":
        #     shell(f"""
        #     quast.py {wildcards.sample} -o {PATH_QUAST} -t {THREADS_NUMBER} -1 {PATH_PROJECT}/fasta_output/{sample}_R1_val_1.fq.gz -2 {PATH_PROJECT}/fasta_output/{sample}_R2_val_2.fq.gz
        #     mv report.tsv > {wildcards.sample}_report.tsv
        #     """)

        # at the moment we only perform quality check on fasta samples
        # COMMENT THIS LINE IF QUALITY CHECK IS PERFORMED DIFFERENTLY ON FASTQ AND FASTA SAMPLES
        shell(f"""
            quast.py {wildcards.sample} -o {PATH_QUAST} -t {THREADS_NUMBER}
            mv report.tsv > {wildcards.sample}_report.tsv
            """)
        print(f"Quast completed")