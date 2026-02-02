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
            
elif type == "fastq":
    if paired != "yes":
        rule quality_assessment_fastq_unpaired:
            input:
                fasta_file = os.path.join(PATH_PROJECT, "{sample}.fasta"),
                fastq_file = os.path.join(PATH_OUTPUT, "trim/{sample}_R1_001_val_1.fq.gz")
            output:
                quast = directory(os.path.join(PATH_OUTPUT, "quality_assessment/quast_results/{sample}")),
                fastqc = directory(os.path.join(PATH_OUTPUT, "quality_assessment/fastqc_results/{sample}"))          
            run:
                print(f"Performing Fastq Quality Assessment")
                shell(f"""
                mkdir -p {output.fastqc}
                mkdir -p {output.quast}
                echo "Performing Fastq"
                fastqc {input.fastq_file}
                unzip -d {output.fastqc} {PATH_OUTPUT}/trim/{wildcards.sample}_R1_001_val_1_fastqc.zip 
                echo "Performing QUAST"
                quast.py {input.fasta_file} -o {output.quast} --single {input.fastq_file} -t {THREADS_NUMBER}
                
                mv {output.quast}/report.tsv {output.quast}/{wildcards.sample}_report.tsv
                """)
    elif paired == "yes":
        rule quality_assessment_fastq_paired:
            input:
                fasta_file = os.path.join(PATH_PROJECT, "{sample}.fasta"),
                fastq_file_1 = os.path.join(PATH_OUTPUT, "trim/{sample}_R1_001_val_1.fq.gz"),
                fastq_file_2 = os.path.join(PATH_OUTPUT, "trim/{sample}_R2_001_val_2.fq.gz")
            output:
                quast = directory(os.path.join(PATH_OUTPUT, "quality_assessment/quast_results/{sample}")),
                fastqc = directory(os.path.join(PATH_OUTPUT, "quality_assessment/fastqc_results/{sample}"))          
            run:
            
                print(f"Performing Fastq Quality Assessment")
                shell(f"""
                mkdir -p {output.fastqc}
                mkdir -p {output.quast}
                echo "Performing Fastq"
                fastqc {input.fastq_file}
                unzip -d {output.fastqc} {PATH_OUTPUT}/trim/{wildcards.sample}_R1_001_val_1_fastqc.zip 
                echo "Performing QUAST"
                quast.py {input.fasta_file} -o {output.quast} -t {THREADS_NUMBER} -1 {input.fastq_file_1} -2 {input.fastq_file_2}
                
                mv {output.quast}/report.tsv {output.quast}/{wildcards.sample}_report.tsv
                """)

# add fastq file for quast:
# if paired:
# quast.py assembly.fasta -1 reads_R1.fastq.gz -2 reads_R2.fastq.gz -o quast_output --threads 8
# if not paired:
# quast.py assembly.fasta --single <sample>.fastq.gz -o quast_output --threads 8