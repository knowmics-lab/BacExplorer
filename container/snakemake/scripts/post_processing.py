import os
import shutil

PATH_OUTPUT = os.path.expanduser("~/bacExplorer-repo/snakemake-BacExplorer/snakemake/samples/output")

# delete all the directories with skipped.marker files inside
def remove_temp(path):
    for root, dirs, files in os.walk(path, topdown=False):
        if any(file == "skipped.marker" for file in files):
            print(f"Deleting temp directory: {root}")
            shutil.rmtree(root)
        

def is_empty_output(file_path, tool_name):
    with open(file_path, 'r') as f:
        lines = f.readlines()

        if len(lines) > 2:
            return False

        if len(lines) == 2 and lines[1].strip() != "":
            return False

        header = ""
        if tool_name == "amrfinder":
            header = "Protein identifier\tContig id\tStart\tStop\tStrand\tGene symbol\tSequence name\tScope\tElement type\tElement subtype\tClass\tSubclass\tMethod\tTarget length\tReference sequence length\t% Coverage of reference sequence\t% Identity to reference sequence\tAlignment length\tAccession of closest sequence\tName of closest sequence\tHMM id\tHMM description"
        elif tool_name == "abricate":
            header = "#FILE	SEQUENCE\tSTART\tEND\tSTRAND\tGENE\tCOVERAGE\tCOVERAGE_MAP\tGAPS\t%COVERAGE\t%IDENTITY\tDATABASE\tACCESSION\tPRODUCT\tRESISTANCE"
        elif file_path.endswith(".tsv") and tool_name == "virulence_finder":
            header = "Database\tVirulence factor\tIdentity\tQuery / Template length\tContig\tPosition in contig\tProtein function\tAccession number"
        return lines[0].strip() == header

def delete_empty_files(directory, tool_name):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".txt") or file.endswith(".tsv"):
                file_path = os.path.join(root, file)
                if is_empty_output(file_path, tool_name):
                    print(f"Deleting empty file: {file_path}")
                    os.remove(file_path)

remove_temp(PATH_OUTPUT)
amrfinder_path = os.path.join(PATH_OUTPUT, "amrfinder")
abricate_path = os.path.join(PATH_OUTPUT, "abricate")
vf_path = os.path.join(PATH_OUTPUT, "virulencefinder")
delete_empty_files(amrfinder_path, "amrfinder")
delete_empty_files(abricate_path, "abricate")
delete_empty_files(vf_path, "virulence_finder")