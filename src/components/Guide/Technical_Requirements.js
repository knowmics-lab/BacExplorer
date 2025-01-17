import React from "react";

export default function TechReq() {
    return(
        <div className='text-container' id="req">
            <h2 className='text-header'>Technical Requirements</h2>
            <ul className='custom-list'>
                <li><span className='text-simple'><b>Installation:</b> ... MEM required </span></li>
                <li><span className='text-simple'><b><i>.fasta</i> analysis:</b> ... RAM required </span></li>
                <li><span className='text-simple'><b><i>.fastq</i> analysis:</b> ... RAM required </span></li>
                <li><span className='text-simple'><b>Kraken 2:</b> +8GB RAM required.
                Otherwise the workflow won't perform Kraken without producing any errors. </span></li>
            </ul>
        </div>
    )
}