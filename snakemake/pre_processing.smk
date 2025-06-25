# import os
# import glob

# PATH_PROJECT = os.environ["PATH_PROJECT"]
# type = os.environ["type"]
# SAMPLES = os.environ["SAMPLES"]
# FASTQ_SAMPLES = os.environ["FASTQ_SAMPLES"]

def change_fasta_format():
    formats = [".fa", '.fna', '.fsa']

    for file in os.listdir(PATH_PROJECT):
        filename = os.path.join(PATH_PROJECT, file)

        if os.path.isfile(filename):
            for f in formats:
                if filename.endswith(f):
                    new_name = filename.rsplit('.', 1)[0] + '.fasta'
                    new_filename = os.path.join(PATH_PROJECT, new_name)
                    os.rename(filename, new_filename)

def create_fastq_dir(FASTQ_DIR):
    os.makedirs(FASTQ_DIR, exist_ok=True)
    for file in os.listdir(PATH_PROJECT):
        if file.endswith(".gz"):
            source_path = os.path.join(PATH_PROJECT, file)
            destination_path = os.path.join(FASTQ_DIR, file)
            shutil.move(source_path, destination_path)

    print("FASTQ_DIR: ", FASTQ_DIR)


def change_fastq_suffixes(FASTQ_DIR, std_suffix_1, std_suffix_2):
    
    suffixes_1 = ['_R1.fastq.gz', '_1.fastq.gz']
    suffixes_2 = ['_R2.fastq.gz', '_2.fastq.gz']

    for file in os.listdir(FASTQ_DIR):
        filename = os.path.join(FASTQ_DIR, file)
        print(f"Evaluating {filename}")
        for f in suffixes_1:
            if f in filename:
                print(f"Filename: {filename} replacing {f} with {std_suffix_1}")
                new_filename = filename.replace(f, std_suffix_1)
                print(f"Replacing with: {new_filename}")
                os.rename(filename, new_filename)
                print(f"New filename: {filename}")
        for f in suffixes_2:
            if f in filename:
                print(f"Filename: {filename} replacing {f} with {std_suffix_2}")
                new_filename = filename.replace(f, std_suffix_2)
                os.rename(filename, new_filename)
                print(f"New filename: {filename}")

def check_format(FASTQ_DIR, std_suffix_1, std_suffix_2):

    invalid = False
    filename = ""
    for file in os.listdir(FASTQ_DIR):
        filename = os.path.join(FASTQ_DIR, file)
        print(f"Evaluating {filename} in check_format")
        if paired=="yes":
            if std_suffix_1 not in filename and std_suffix_2 not in filename:
                invalid = True
    
    if invalid == True:
        raise ValueError(f"Filename format: {filename} invalid.\nValid formats: sample_R1.fastq.gz sample_R2.fastq.gz sample_R1_001.fastq.gz sample_R2_001.fastq.gz sample_1.fastq.gz sample_2.fastq.gz")
    

print(f"Starting preprocessing for type: {type}")

if type == "fasta":
    change_fasta_format()
    SAMPLES = [os.path.splitext(os.path.basename(f))[0] for f in glob.glob(f"{PATH_PROJECT}/*.fasta")]
    print(f"FASTA_SAMPLES: {SAMPLES}")


elif type == "fastq":
    # SAMPLES = [os.path.splitext(os.path.basename(f))[0] for f in glob.glob(f"{PATH_PROJECT}/fasta_output/*.fasta")]
    FASTQ_DIR = os.path.join(PATH_PROJECT, "fastq")
    # FASTA_OUTPUT = os.path.join(PATH_PROJECT, "fasta_output")
    std_suffix_1 = "_R1_001.fastq.gz"
    std_suffix_2 = "_R2_001.fastq.gz"

    create_fastq_dir(FASTQ_DIR)
    change_fastq_suffixes(FASTQ_DIR, std_suffix_1, std_suffix_2)
    check_format(FASTQ_DIR, std_suffix_1, std_suffix_2)
    # define_fastq_samples(FASTQ_DIR)   