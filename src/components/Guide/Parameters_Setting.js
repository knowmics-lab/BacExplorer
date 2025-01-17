import React from "react";

export default function ParamsSet(){
    return(
        <div className='text-container' id='params'>
            <h2 className='text-header'>Parameters setting</h2>
            <div className='text-simple'>Set all your parameters navigating to the <b>Settings</b> page.
                <ul className='custom-list'>
                    <li><span className='text-simple'><b>Genus and species:</b> if all the files in your input folder refer to a certain genus or species,
                    specify them. Otherwise leave blank: the tool will use mlst for classification; if it fails, it will execute kraken2. </span></li>
                    <li><span className='text-simple'><b>Type:</b> specify if your input is <i>.fasta</i> or <i>.fastq</i>.
                    In case of <i>.fastq</i> files, specify if paired or unpaired.
                    <span  className='text-emphasis'> Please make sure to provide your <i>.fastq</i> files in the following format: <b>SAMPLE_NAME.fastq.gz</b> or <b>SAMPLE_NAME.fq.gz</b>.</span></span></li>
                    <li><span className='text-simple'><b>Report parameters:</b> set your chosen values of Identity and Coverage to filter results in the report.
                    Default values are Identity: 90% and Coverage: 90%.</span></li>
                    <li><span className='text-simple'><b>Input folder:</b> select the folder with the samples you want to analyze.</span></li>
                </ul>
                <span className='text-emphasis'>
                    <b> Once you are done, click on Launch analysis and wait.</b> </span>
            </div>
        </div>
    )
}