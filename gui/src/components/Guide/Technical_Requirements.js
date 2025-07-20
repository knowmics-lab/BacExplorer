import React from "react";

export default function TechReq() {
    return(
        <div className='text-container' id="req">
            <h2 className='text-header'>System Requirements</h2>
            <ul className='custom-list'>
                <li><span className='text-simple'><b>Installation:</b> at least 36 GB of storage space required. </span></li>
                <li><span className='text-simple'><b>FASTA analysis:</b> at least 8 GB of RAM required to perform the analysis on one sample.</span></li>
                <li><span className='text-simple'><b>FASTQ analysis:</b> at least 8 GB of RAM required to perform the analysis on one sample. </span></li>
                <li><span className='text-simple'><b>Kraken2:</b> at least 8GB of RAM required.
                Otherwise Kraken will be skipped. </span></li>
                <li><span className='text-simple'><b>geNomad:</b> the tool can perform only on x86/x64 architectures.
                If your machine has got an ARM processor, geNomad will be skipped. </span></li>
            </ul>
        </div>
    )
}