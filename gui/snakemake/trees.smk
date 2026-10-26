import os
import sys
import psutil
import json
import traceback
from snakemake import shell

PHYLO_TREE_DIR = os.path.join(PATH_OUTPUT, "phylogenetic_tree")

rule vbcg:
    input:
        samples = os.path.join(PATH_PROJECT, "fasta_samples")
    output:
        vbcg = directory(os.path.join(PHYLO_TREE_DIR, "core"))
    params:
        VBCG_PATH = os.path.join(PATH_ENV, "vbcg", "bin")
    run:
        if VBCG == "yes":
            print(f"Building core tree")
            shell(f"""
            mkdir -p {output.vbcg}
            python {params.VBCG_PATH}/vbcg.py -i {input.samples} -o {output.vbcg} -n 2
            """)
        else:
            shell(f"""
            mkdir -p {output.vbcg}
            touch {output.vbcg}/skipped.marker
            """)

ALL_TREE_DIR = os.path.join(PHYLO_TREE_DIR, "all")

rule phylo_tree:
    input:
        fasta = os.path.join(FASTA_SAMPLES_DIR, "{sample}.fasta")
    output:
        out_dir = ALL_TREE_DIR
    params:
        reference_genome = REFERENCE_GENOME,
        BCFTOOLS_PATH = os.path.join(PATH_ENV, "bin", "bcftools"),
        sam = os.path.join(ALL_TREE_DIR, "{sample}.sam"),
        bam = os.path.join(ALL_TREE_DIR, "{sample}.bam"),
        vcf = os.path.join(ALL_TREE_DIR, "{sample}.vcf"),
        vcf_idx = os.path.join(ALL_TREE_DIR, "{sample}.vcf.gz"),
        consensus = os.path.join(ALL_TREE_DIR, "{sample}.fa")
    run:
        if PHYLO_TREE == "yes":
            
            # alla fine cambia l'header del consensus con il nome del campione
            shell(f"""
            mkdir -p {output.out_dir}
            bwa index {params.reference_genome}
            bwa mem -t 16 {params.reference_genome} {input.fasta} > {params.sam}
            samtools sort -o {params.bam} {params.sam}
            {params.BCFTOOLS_PATH} mpileup --fasta-ref {params.reference_genome} {params.bam} | {params.BCFTOOLS_PATH} call --multiallelic-caller --variants-only --ploidy 1 --output-type v - > {params.vcf}
            bgzip -c {params.vcf} > {params.vcf_idx}
            tabix {params.vcf_idx}
            {params.BCFTOOLS_PATH} consensus -f {params.reference_genome} {params.vcf_idx} > {params.consensus}
            # modifica l'header
            # mv {params.consensus} "{ALL_TREE_DIR}/{wildcards.sample}.fa"
            """)
            create_phylo_tree()
        else:
            shell(f"""
            mkdir -p {output.out_dir} && touch {output.out_dir}/skipped.marker
            """)

rule create_phylo_tree:
    input:
        # Recuperiamo TUTTI i file consensus generati dalla regola precedente
        # Sostituisci SAMPLES con la tua lista di nomi dei campioni
        consensus_files = expand(os.path.join(ALL_TREE_DIR, "{sample}.fa"), sample=SAMPLES)
    output:
        # L'output finale è l'albero (uno solo per tutto il progetto)
        final_tree = os.path.join(ALL_TREE_DIR, "final_phylogenetic_tree.nwk")
    params:
        combined_fasta = os.path.join(ALL_TREE_DIR, "all_samples_combined.fasta"),
        alignment = os.path.join(ALL_TREE_DIR, "alignment_mafft.fasta")
    shell:
        """
        cat {input.consensus_files} > {params.combined_fasta}
        
        mafft --thread {THREADS_NUMBER} --maxiterate 100 {params.combined_fasta} > {params.alignment}
        
        fasttree -gtr -nt {params.alignment} > {output.final_tree}
        """
