print(FASTQ_SAMPLES)
print(SAMPLES)

if type == "fasta":
    rule quality_assessment_fasta:
        input:
            fasta_file = os.path.join(PATH_PROJECT, "{sample}.fasta")
        output:
            quast = directory(os.path.join(PATH_OUTPUT, "quality_assessment/quast_results/{sample}"))
        run:
            print(f"Performing QUAST")
            shell(f"""
            mkdir -p {output.quast}
            quast.py {input.fasta_file} -o {output.quast} -t {THREADS_NUMBER}
            mv {output.quast}/report.tsv {output.quast}/{wildcards.sample}_report.tsv
            """)
            
if type == "fastq":
    rule quality_assessment_fastq:
        input:
            fasta_file = os.path.join(PATH_PROJECT, "{sample}.fasta"),
            fastq_file_1 = os.path.join(PATH_OUTPUT, "trim/{sample}_R1_001_val_1.fq.gz")
        output:
            quast = directory(os.path.join(PATH_OUTPUT, "quality_assessment/quast_results/{sample}")),
            fastqc = directory(os.path.join(PATH_OUTPUT, "quality_assessment/fastqc_results/{sample}"))           
        run:
            print(f"Performing Fastq Quality Assessment")
            shell(f"""
            mkdir -p {output.fastqc}
            mkdir -p {output.quast}
            echo "Performing Fastq"
            fastqc {input.fastq_file_1}
            unzip -d {output.fastqc} {PATH_OUTPUT}/trim/{wildcards.sample}_R1_001_val_1_fastqc.zip
            """)
            if paired == "yes":
                shell(f"""
                fastqc {PATH_OUTPUT}/trim/{wildcards.sample}_R2_001_val_2.fq.gz
                unzip -d {output.fastqc} {PATH_OUTPUT}/trim/{wildcards.sample}_R2_001_val_2_fastqc.zip
                """)
            print(f"Performing QUAST")
            shell(f"""
            mkdir -p {output.quast}
            quast.py {input.fasta_file} -o {output.quast} -t {THREADS_NUMBER}
            mv {output.quast}/report.tsv {output.quast}/{wildcards.sample}_report.tsv
            """)