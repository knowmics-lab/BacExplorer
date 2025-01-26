# choose the samples directory
SAMPLES = []
if type == "fasta":
    SAMPLES = [os.path.splitext(os.path.basename(f))[0] for f in glob.glob(f"{PATH_PROJECT}/*.fasta")]
elif type == "fastq":
    SAMPLES = [os.path.splitext(os.path.basename(f))[0] for f in glob.glob(f"{PATH_PROJECT}/fasta_output/*.fasta")]
    PATH_PROJECT = os.path.join(PATH_PROJECT, "fasta_output")

print("FASTA SAMPLES: ", SAMPLES)

rule all:
    input:
        expand(os.path.join(PATH_OUTPUT, "kraken2/{sample}_kraken2.txt"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "kraken2/{sample}_result.txt"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "mlst/{sample}.txt"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "mlst/{sample}_result.txt"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "amrfinder/{sample}_amrfinder.txt"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "virulencefinder/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "abricate/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "kleborate/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "abricate_ecoli/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "ectyper/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "shigatyper/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "emmtyper/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "sccmec/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "legsta/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "pbptyper/{sample}"), sample=SAMPLES),
        expand(os.path.join(PATH_OUTPUT, "hicap/{sample}"), sample=SAMPLES)
    params:
        report_file = os.path.join(PATH_OUTPUT, f"{ANALYSIS_NAME}_report.html"),
        report = os.path.join(PATH_SCRIPT, "scripts/report.Rmd"),
        post_processing = os.path.join(PATH_SCRIPT, "scripts/post_processing.py")
    shell:
        '''
        echo "Execution complete\nPostprocessing..."
        python {params.post_processing}
        '''

# Rscript -e "rmarkdown::render('{params.report}', output_file='{params.report_file}',
#         output_dir = '{PATH_OUTPUT}', params=list(path_output='{PATH_OUTPUT}',
#         identity={IDENTITY}, coverage={COVERAGE}))"

rule mlst:
    input:
        fasta_file = lambda wildcards: os.path.join(PATH_PROJECT, f"{wildcards.sample}.fasta")
    output:
        mlst_output = os.path.join(PATH_OUTPUT, "mlst/{sample}.txt"),
        genus_species = os.path.join(PATH_OUTPUT, "mlst/{sample}_result.txt")
    run:
        if GENUS == "":
            shell(f"""
                echo "RULE: MLST, debug: {wildcards.sample}"
                echo "Scan contig files against traditional PubMLST typing schemes"
                mlst {input.fasta_file} > {output.mlst_output}
                echo "output: {output.mlst_output}"
            """)
            check_mlst(output.mlst_output, output.genus_species)
        else:
            shell(f"""
            echo "{GENUS}_{SPECIES}"> {output.mlst_output}
            cp {output.mlst_output} {output.genus_species}
            """)

def check_mlst (input_file, output_file):
    correspondeces = os.path.join(PATH_SCRIPT, "resources/Lista_mlst.csv")
    df = pd.read_csv(correspondeces, sep=",", header=None)

    mlst = df.iloc[:, 0]
    organism = df.iloc[:, 1]

    mlst_to_organism = dict(zip(mlst, organism))

    with open(input_file, "r") as infile, open(output_file, "w") as outfile:
        linea = infile.readline().strip()
        colonne = linea.split('\t')
        
        if len(colonne) > 1:
            value = colonne[1]
            print("Colonna 1: ", value)
            if value in mlst_to_organism:
                print("Valore nel dizionario: ", {mlst_to_organism[value]})
                if "_" not in mlst_to_organism[value]:
                    outfile.write(f"{mlst_to_organism[value]}_")
                else:
                    outfile.write(f"{mlst_to_organism[value]}")
            else:
                outfile.write(f"Unknown_organism\n")
        else:
            print("ERROR: Organism not found")

#basato sull'output della regola Check_mlst
rule kraken2:
    input:
        fasta_input = os.path.join(PATH_PROJECT, "{sample}.fasta"),
        mlst_output = os.path.join(PATH_OUTPUT, "mlst/{sample}_result.txt")
    output:
        report = os.path.join(PATH_OUTPUT, "kraken2/{sample}_kraken2.txt"),
        genus_species = os.path.join(PATH_OUTPUT, "kraken2/{sample}_result.txt")
        
    run:
        THRESHOLD = 8000
        available_ram = psutil.virtual_memory().available / (1024 * 1024)
        if available_ram >= THRESHOLD:
            try:
                organism = ""
                with open(input.mlst_output, 'r') as infile:
                    organism = infile.readline().strip()
                    if organism.endswith("_"):
                        organism = organism[:-1]

                    print("MLST output: ", organism)

                if organism == "Unknown_organism":
                    print("Performing Kraken")
                    shell(f'''
                    kraken2 --threads 2 --db {PATH_KRAKEN_DB} --report {output.report} {input.fasta_input}
                    ''')
                else:
                    print(f"Organism classified by MLST.")
                    with open(output.report, 'w') as out:
                        out.write(f"Check MLST output")
            except FileNotFoundError:
                print(f"Error: File {input.mlst_output} not found")
            except Exception as e:
                print(f"An error occured: {e}")
        else:
            print(f"Available RAM: {available_ram} MB is insufficient. Unable to perform Kraken.")
            with open(output.report, 'w') as out:
                out.write(f"Check MLST output") 
        process_kraken2_output(output.report, output.genus_species)

def process_kraken2_output(input_file, output_file):
    with open(output_file, "w") as out, open(input_file, "r") as infile:
        if infile.readline().strip() != "Check MLST output":
            print("Sono nell'if")
            df = pd.read_csv(infile, sep="\t", header=None)
            genus = df.loc[df[3] == "G", 5].iloc[0].strip()
            species = df.loc[df[3] == "S", 5].iloc[0].strip().split()[-1]
            out.write(f"{genus}_{species}\n")
            return
        else:
            out.write(f"Check MLST output")

rule AMRfinder:
    input:
        organism = os.path.join(PATH_OUTPUT, "mlst/{sample}_result.txt"),
        kraken_report = os.path.join(PATH_OUTPUT, "kraken2/{sample}_result.txt"),
        fasta_input = os.path.join(PATH_PROJECT, "{sample}.fasta")
    output:
        amr_output = os.path.join(PATH_OUTPUT, "amrfinder/{sample}_amrfinder.txt")
    shell:
        """
        echo "AMRfinder plus"
        organism=""

        kraken_output=$(sed -n '1p' {input.kraken_report})
        
        if [[ "$kraken_output" != "Check MLST output" ]]; then
            organism=$(sed -n '1p' {input.kraken_report})
        fi
        if [[ "$kraken_output" == "Check MLST output" ]]; then
            organism=$(sed -n '1p' {input.organism})
        fi

        genus=$(echo "$organism" | sed -n '1s/_.*//p')

        if [[ "$organism" == "Acinetobacter_baumannii" ]] || [[ "$organism" == "Burkholderia_cepacia" ]] || 
        [[ "$organism" == "Burkholderia_pseudomallei" ]] || [[ "$organism" == "Citrobacter_freundii" ]] || 
        [[ "$organism" == "Clostridioides_difficile" ]] || [[ "$organism" == "Enterobacter_cloacae" ]] || 
        [[ "$organism" == "Enterobacter_asburiae" ]] || [[ "$organism" == "Enterococcus_faecalis" ]] || 
        [[ "$organism" == "Enterococcus_faecium" ]] || [[ "$organism" == "Klebsiella_pneumoniae" ]] || 
        [[ "$organism" == "Klebsiella_oxytoca" ]] || [[ "$organism" == "Neisseria_gonorrhoeae" ]] || 
        [[ "$organism" == "Neisseria_meningitidis" ]] ||
        [[ "$organism" == "Pseudomonas_aeruginosa" ]] || [[ "$organism" == "Serratia_marcescens" ]] || 
        [[ "$organism" == "Staphylococcus_aureus" ]] || [[ "$organism" == "Staphylococcus_pseudintermedius" ]] || 
        [[ "$organism" == "Streptococcus_agalactiae" ]] || [[ "$organism" == "Streptococcus_pneumoniae" ]] || 
        [[ "$organism" == "Streptococcus_pyogenes" ]] || [[ "$organism" == "Vibrio_cholerae" ]] || 
        [[ "$organism" == "Vibrio_vulfinicus" ]] || [[ "$organism" == "Vibrio_parahaemolyticus" ]]; then
            amrfinder -n {input.fasta_input} -O $organism --plus > {output.amr_output}
        elif [[ "$genus" == "Escherichia" ]] || [[ "$genus" == "Campylobacter" ]] || [[ "$genus" == "Salmonella" ]]; then
            amrfinder -n {input.fasta_input} -O $genus --plus > {output.amr_output}
        else
            amrfinder -n {input.fasta_input} --plus > {output.amr_output}
        fi
        """

rule abricate:
    input:
        fasta_input = os.path.join(PATH_PROJECT, "{sample}.fasta")
    output:
        abricate = directory(os.path.join(PATH_OUTPUT, "abricate/{sample}"))
    shell:
        """
        echo "Abricate"
        mkdir -p {output.abricate}
        abricate {input.fasta_input} --db ncbi > {output.abricate}/{wildcards.sample}_ncbi.txt
        abricate {input.fasta_input} --db vfdb > {output.abricate}/{wildcards.sample}_vfdb.txt
        abricate {input.fasta_input} --db card > {output.abricate}/{wildcards.sample}_card.txt
        abricate {input.fasta_input} --db argannot > {output.abricate}/{wildcards.sample}_argannot.txt
        abricate {input.fasta_input} --db resfinder > {output.abricate}/{wildcards.sample}_resfinder.txt
        abricate {input.fasta_input} --db plasmidfinder > {output.abricate}/{wildcards.sample}_plasmidfinder.txt
        abricate {input.fasta_input} --db megares > {output.abricate}/{wildcards.sample}_megares.txt
        """
        
rule check_genus:
    input:
        fasta_input = os.path.join(PATH_PROJECT, "{sample}.fasta"),
        parsed = os.path.join(PATH_OUTPUT, "mlst/{sample}_result.txt"),
        kraken_report = os.path.join(PATH_OUTPUT, "kraken2/{sample}_result.txt")
    output:
        sccmec = directory(os.path.join(PATH_OUTPUT, "sccmec/{sample}")),
        spatyper = directory(os.path.join(PATH_OUTPUT, "spatyper/{sample}")),
        agrvate = directory(os.path.join(PATH_OUTPUT, "agrvate/{sample}")),
        shigatyper = directory(os.path.join(PATH_OUTPUT, "shigatyper/{sample}"))
    shell:
        """
        kraken_output=$(sed -n '1p' {input.kraken_report})
        genus=""
        
        if [[ "$kraken_output" != "Check MLST output" ]]; then
            genus=$(sed -n '1s/_.*//p' {input.kraken_report})
        fi
        if [[ "$kraken_output" == "Check MLST output" ]]; then
            genus=$(sed -n '1s/_.*//p' {input.parsed})
        fi
        
        echo "$genus"
        
        mkdir -p {output.sccmec}
        mkdir -p {output.agrvate}
        mkdir -p {output.spatyper}
        if [[ "$genus" == "Staphylococcus" ]]; then
            echo "Performing sccmec"
            sccmec --input {input.fasta_input} --outdir {output.sccmec} --force
            echo "Performing spaTyper"
            spaTyper -f {input.fasta_input} --output {output.spatyper}/{wildcards.sample}.txt
            echo "Performing agrvate"
            agrvate -i {input.fasta_input}
            chmod u+w {wildcards.sample}-results
            mv {wildcards.sample}-results/ {output.agrvate}
        else
            touch {output.agrvate}/skipped.marker
            touch {output.sccmec}/skipped.marker
            touch {output.spatyper}/skipped.marker
        fi

        mkdir -p {output.shigatyper}
        if [[ "$genus" == "Shigella" ]]; then
            echo "Performing ShigaTyper"
            shigatyper --SE {input.fasta_input} -n {output.shigatyper} --verbose
            mv {output.shigatyper}/{wildcards.sample}.tsv {output.shigatyper}/{wildcards.sample}_def.tsv
        else
            touch {output.shigatyper}/skipped.marker
        fi
        """


rule check_genus_species:
    input:
        fasta_input = os.path.join(PATH_PROJECT, "{sample}.fasta"),
        parsed = os.path.join(PATH_OUTPUT, "mlst/{sample}_result.txt"),
        kraken_report = os.path.join(PATH_OUTPUT, "kraken2/{sample}_result.txt")
    output:
        kleborate = directory(os.path.join(PATH_OUTPUT, "kleborate/{sample}")),
        kleborate_escherichia = directory(os.path.join(PATH_OUTPUT, "kleborate_escherichia/{sample}")),
        abricate = directory(os.path.join(PATH_OUTPUT, "abricate_ecoli/{sample}")),
        ectyper = directory(os.path.join(PATH_OUTPUT, "ectyper/{sample}")),
        emmtyper = directory(os.path.join(PATH_OUTPUT, "emmtyper/{sample}")),
        legsta = directory(os.path.join(PATH_OUTPUT, "legsta/{sample}")),
        lissero = directory(os.path.join(PATH_OUTPUT, "lissero/{sample}")),
        pbptyper = directory(os.path.join(PATH_OUTPUT, "pbptyper/{sample}")),
        hicap = directory(os.path.join(PATH_OUTPUT, "hicap/{sample}"))
    shell:
        """
        kraken_output=$(sed -n '1p' {input.kraken_report})
        
        genus=""
        species=""

        if [[ "$kraken_output" != "Check MLST output" ]]; then
            genus=$(sed -n '1s/_.*//p' {input.kraken_report})
            species=$(sed -n '1s/^[^_]*_//p' {input.kraken_report})
        fi
        if [[ "$kraken_output" == "Check MLST output" ]]; then
            genus=$(sed -n '1s/_.*//p' {input.parsed})
            species=$(sed -n '1s/^[^_]*_//p' {input.parsed})
        fi

        echo "DEBUG CHECK_GENUS_SPECIES: genus=$genus, species=$species"

        mkdir -p {output.kleborate}
        if [[ "$genus" == "Klebsiella" ]]; then
            echo "Performing Kleborate"
            if [[ "$species" == "oxytoca" ]]; then
                kleborate -o {output.kleborate} -a {input.fasta_input} -p kosc
            elif [[ "$species" == "" ]] || [[ "$species" == "pneumoniae" ]]; then
                kleborate -o {output.kleborate} -a {input.fasta_input} -p kpsc
            fi
        else
            touch {output.kleborate}/skipped.marker
        fi

        mkdir -p {output.abricate}
        mkdir -p {output.ectyper}
        mkdir -p {output.kleborate_escherichia}
        if [[ "$genus" == "Escherichia" && "$species" == "coli" ]]; then
            echo "Performing Kleborate"
            kleborate  -a {input.fasta_input} -o {output.kleborate_escherichia} -p escherichia
            echo "Performing Abricate"
            abricate {input.fasta_input} --db ecoli_vf > {output.abricate}/{wildcards.sample}_ecoli_vf.txt
            abricate {input.fasta_input} --db ecoh > {output.abricate}/{wildcards.sample}_ecoh.txt
            echo "Performing Ectyper"
            ectyper -i {input.fasta_input} -o {output.ectyper}
            mv {output.ectyper}/output.tsv {output.ectyper}/{wildcards.sample}.tsv
        else
            touch {output.ectyper}/skipped.marker
            touch {output.kleborate_escherichia}/skipped.marker
            touch {output.abricate}/skipped.marker
        fi

        mkdir -p {output.emmtyper}
        mkdir -p {output.pbptyper}
        if [[ "$genus" == "Streptococcus" ]]; then
            if [[ "$species" == "pyogenes" ]]; then
                echo "Performing Emmtyper"
                emmtyper {input.fasta_input} --output {output.emmtyper}/{wildcards.sample}.txt
            fi
            if [[ "$species" == "pneumoniae" ]]; then
                echo "Performing pbptyper"
                pbptyper --input {input.fasta_input} --prefix {wildcards.sample} --outdir {output.pbptyper}  
            fi
        else
            touch {output.emmtyper}/skipped.marker
            touch {output.pbptyper}/skipped.marker
        fi

        mkdir {output.legsta}
        if [[ "$genus" == "Legionella" && "$species" == "pneumophyla" ]]; then
            echo "Performing Legsta"
            legsta {input.fasta_input} > {output.legsta}/{wildcards.sample}.tsv
        else
            touch {output.legsta}/skipped.marker
        fi

        mkdir -p {output.lissero}
        if [[ "$genus" == "Listeria" && "$species" == "monocytogenes" ]]; then
            echo "Performing LisSero"
            lissero {input.fasta_input} > {output.lissero}/{wildcards.sample}.txt
        else
            touch {output.lissero}/skipped.marker
        fi

        mkdir -p {output.hicap}
        if [[ "$genus" == "Haemophilus" && "$species" == "influenzae" ]]; then
            echo "Performing Hicap"
            hicap --query_fp {input.fasta_input} --output_dir {output.hicap}
        else
            touch {output.hicap}/skipped.marker
        fi
        """

rule virulencefinder:
    input:
        fasta_input = os.path.join(PATH_PROJECT, "{sample}.fasta")
    output:
        virulencefinder = directory(os.path.join(PATH_OUTPUT, "virulencefinder/{sample}"))
    params:
        path_db = PATH_VIRULENCE_DB
    shell:
        """
        echo "Virulence finder"
        mkdir -p {output.virulencefinder}
        virulencefinder.py -i {input.fasta_input} -o {output.virulencefinder} -p {params.path_db} -x        
        mv {output.virulencefinder}/Virulence_genes.fsa {output.virulencefinder}/{wildcards.sample}_Virulence_genes.fsa
        mv {output.virulencefinder}/results_tab.tsv {output.virulencefinder}/{wildcards.sample}_results_tab.tsv
        mv {output.virulencefinder}/results.txt {output.virulencefinder}/{wildcards.sample}_results.txt
        mv {output.virulencefinder}/Hit_in_genome_seq.fsa {output.virulencefinder}/{wildcards.sample}_Hit_in_genome_seq.fsa
        mv {output.virulencefinder}/data.json {output.virulencefinder}/{wildcards.sample}_data.json
        """