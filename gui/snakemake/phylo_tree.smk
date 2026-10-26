import os
import sys
import psutil
import json
import traceback
from snakemake import shell

BCFTOOLS_PATH = os.path.join(PATH_ENV, "bin", "bcftools")
SAMPLE_PATH = os.path.join(PATH_PROJECT, "fasta_output")

# phylogenetic trees
shell(f"""
for SAMPLE in $(ls {SAMPLE_PATH}) do
    FN=$(basename $SAMPLE ".fasta")

        bwa mem -t 16 {REFERENCE_GENOME} {SAMPLE_PATH}/${FN}.fasta > {SAMPLE_PATH}/${FN}.sam
        samtools sort -o {SAMPLE_PATH}/${FN}.bam {SAMPLE_PATH}/${FN}.sam
        {BCFTOOLS_PATH} mpileup --fasta-ref {REFERENCE_GENOME} {SAMPLE_PATH}/${FN}.bam | {BCFTOOLS_PATH} call --multiallelic-caller --variants-only --ploidy 1 --output-type v - > {SAMPLE_PATH}/${FN}.vcf
        bgzip -c {SAMPLE_PATH}/${FN}.vcf > {SAMPLE_PATH}/${FN}.vcf.gz
        tabix {SAMPLE_PATH}/${FN}.vcf.gz
        {BCFTOOLS_PATH} consensus -f {REFERENCE_GENOME} {SAMPLE_PATH}/${FN}.vcf.gz > {SAMPLE_PATH}/${FN}.fa

done

cat *.fa >> ${FN}_tree.fa
mafft --thread 10 --maxiterate 100 ${FN}_tree.fa > mafft_${FN}
fasttree -gtr -nt mafft_${FN} > fasttree_${FN}
""")