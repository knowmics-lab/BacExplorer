import os
import sys
import psutil
import json
import traceback
from snakemake import shell

# sistema i fastq

rule snippy:
    input:
        # fastq_1 = os.path.join(FASTQ_DIR, "{sample}_R1_001.fastq.gz"),
        # fastq_2 = os.path.join(FASTQ_DIR, "{sample}_R2_001.fastq.gz"),
        fasta = os.path.join(FASTA_SAMPLES_DIR, "{sample}.fasta")
    output:
        snippy = directory(os.path.join(PATH_OUTPUT, "snippy/{sample}"))
    params:
        reference_genome = REFERENCE_GENOME
    run:
    #la crea già snippy
        # shell(f"""
        # mkdir -p {output.snippy}
        # """)
        if SNIPPY == "yes":
            print(f"Performing Snippy")
            if (type == "fasta"):
                shell(f"""
                snippy --cpus 2 --outdir {output.snippy} --ref {params.reference_genome} --ctgs {input.fasta} --force
                """)
            elif (type == "fastq"):
                # shell(f"""
                # snippy --cpus 2 --outdir {output.snippy} --ref {params.reference_genome} --R1 {input.fastq_1} --R2 {input.fastq_2} --force
                # """)
                print(f"No")
            for file in os.listdir(output.snippy):
                if file.endswith(".tab"):
                    new_filename = os.path.join(output.snippy, f"{wildcards.sample}.tab")
                    filename = os.path.join(output.snippy, file)
                    os.rename(filename, new_filename)
            
            # trasforma il .tab con il nome del campione
        else:
            shell(f"""
            mkdir -p {output.snippy_dir} && touch {output.snippy_dir}/skipped.marker
            """)