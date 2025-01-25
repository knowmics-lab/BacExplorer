import React from "react";

export default function TechReq() {
    return(
        <div className='text-container' id="req">
            <h2 className='text-header'>System Requirements</h2>
            <ul className='custom-list'>
                <li><span className='text-simple'><b>Installation:</b> at least 25 GB of storage space required </span></li>
                <li><span className='text-simple'><b><i>.fasta</i> analysis:</b> at least 8 GB of RAM required to perform the analysis on one sample</span></li>
                <li><span className='text-simple'><b><i>.fastq</i> analysis:</b> at least 8 GB of RAM required to perform the analysis on one sample </span></li>
                <li><span className='text-simple'><b>Kraken 2:</b> at least 8GB of RAM required.
                Otherwise the workflow won't perform Kraken without producing any errors. </span></li>
            </ul>
        </div>
    )
}