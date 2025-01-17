import React from "react";

export default function OutputOrg() {
    return(
        <div className='text-container' id='out'>
            <h2 className='text-header'>Output organization</h2>
            <div className='text-simple'>Each analysis is identified by the name you will specify in the setting page. <br/>
                Please collect each of your analyses in a principal directory (now called "ANALYSIS_FOLDER"). <br/>
                Take note of the following hieracy:
                <ul className='custom-list'>
                    <li className='example'>ANALYSIS FOLDER
                        <ul className='custom-list'>
                            <li>Analysis1_samples</li>
                            <ul className='custom-list'>
                                <li>Output
                                    <ul className='custom-list'>
                                        <li>mlst</li>
                                        <li>amrfinder</li>
                                        <li>agrvate</li>
                                        <li>legsta</li>
                                        <li>...folders for each tool used</li>
                                        <li>file - collects xlsx files produced by the report -</li>
                                        <li>report.html</li>
                                    </ul>
                                </li>

                            </ul>
                            <li>Analysis2_samples</li>
                            <ul className='custom-list'>
                                <li>Output
                                    <ul className='custom-list'>
                                        <li>...</li>
                                    </ul>
                                </li>
                            </ul>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    )
}