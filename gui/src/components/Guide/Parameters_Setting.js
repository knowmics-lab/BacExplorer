import React from "react";

export default function ParamsSet(){
    return(
        <div className='text-container' id='params'>
            <h2 className='text-header'>Parameters Setting</h2>
            <div className='text-simple'>Set all your parameters navigating to the <b>Analysis</b> page.
                <ul className='custom-list'>
                    <li><span className='text-simple'><b>Genus and species:</b> if all the files in your input folder refer to a certain genus or species,
                    specify them. Otherwise leave blank: the tool will use <i><b>mlst</b></i> for classification; if it fails, it will execute <i><b>kraken2</b></i>. </span></li>
                    <li><span className='text-simple'><b>Type:</b> specify if your input is FASTA or FASTQ.
                    In case of <i>.fastq</i> files, specify if paired or unpaired.
                    <span className='text-emphasis' style={{textDecoration:"none"}}> Please make sure to provide your FASTQ files in the following format: <b>SAMPLE_NAME.fastq.gz</b> or <b>SAMPLE_NAME.fq.gz</b>.</span></span></li>
                    <li><span className='text-simple'><b>Tecnhical Settings:</b> you can modify the number of threads to use during the analysis and choose to perform <i><b>geNomad</b></i> or not. <span className='text-emphasis' style={{textDecoration:"none"}}>Don't change the default values if you are not aware of your
                    machine's specs.</span></span></li>
                        <li><span className='text-simple'><b>Report parameters:</b> set your chosen values of <i><b>Identity</b></i> and <i><b>Coverage</b></i> to filter results in the report.
                        Default values are Identity: 90% and Coverage: 90%.</span></li>
                    <li><span className='text-simple'><b>Input folder:</b> select the folder with the samples you want to analyze.</span></li>
                </ul>
                <span className='text-emphasis'>
                    <b> Once you are finished, click on Done to save your configuration, then click on Launch analysis and wait.</b> </span>
            </div>
        </div>
    )
}