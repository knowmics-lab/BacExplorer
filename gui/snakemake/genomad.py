import os
import psutil
import json
import traceback
from snakemake import shell

def genomad(SAMPLES, PATH_OUTPUT, PATH_PROJECT, PATH_GENOMAD):

    for sample in SAMPLES:
        try:
            fasta_input = os.path.join(PATH_PROJECT, f"{sample}.fasta")
            output_genomad = os.path.join(PATH_OUTPUT, f"genomad/{sample}")
            THRESHOLD = 4000
            available_ram = psutil.virtual_memory().available / (1024 * 1024)

            if available_ram >= THRESHOLD:
                print(f"Performing genomad on {sample}")
                shell(f"""
                mkdir -p {output_genomad}
                genomad end-to-end --cleanup --splits 16 {fasta_input} {output_genomad} {PATH_GENOMAD}
                """)
            else:
                print(f"[Warning] Insufficient RAM to perform genomad on {sample} "
                  f"(available: {available_ram:.2f} MB, required: {THRESHOLD} MB)",
                  file=sys.stderr)
            traceback.print_stack(file=sys.stderr)
        except Exception as e:
                print(f"[Warning] Genomad failed for sample {sample}: {e}")
                traceback.print_exc()

PATH_OUTPUT = os.environ["PATH_OUTPUT"]
PATH_PROJECT = os.environ["PATH_PROJECT"]
PATH_GENOMAD = os.environ["PATH_GENOMAD"]
SAMPLES = json.loads(os.environ["SAMPLES"])

print(f"SAMPLES: {SAMPLES}")

genomad(SAMPLES, PATH_OUTPUT, PATH_PROJECT, PATH_GENOMAD)