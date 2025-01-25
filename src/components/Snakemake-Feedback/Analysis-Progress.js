import React from "react";
import { useState, useEffect } from "react";
import { ProgressBar, Modal } from "react-bootstrap";

export default function AnalysisProg({progress, setProgress}) {
    const [output, setOutput] = useState("");
    const [error, setError] = useState({error: false, message: ""});
    const [finished, setFinished] = useState(false);
    

    useEffect(() => {
        window.api.onSnakemakeOutput((data) => {
            // console.log('Received data from Snakemake: ', data);

            if (data) {
            console.log('Data properties:', data);
            }

            if (data.stderr) {
                console.log("Data.stderr: ", data.stderr);
                if (data.stderr.match(/WorkflowError/) || data.stderr.match(/IncompleteFilesException/)) {
                    setError({error: true, message: `Stderr: ${data.stderr}`});

                    console.log("STOPPED EXECUTION");
                    return;
                }
                if (data.stderr.match(/Finished job/)) {
                    setOutput(`Stderr: ${data.stderr}`);
                    setFinished(true);
                    //setProgress(100);
                    console.log("ANALYSIS COMPLETED. Producing report...");
                    window.api.launchReport();
                }
                else {
                    setOutput(`Stderr: ${data.stderr}`);
                }
                const progressMatch = data.stderr.match(/(\d+)%/);
                if (progressMatch) {
                    console.log("Progress match: ", progressMatch);
                    console.log("Progress match[1]: ", progressMatch[1]);
                    if (progressMatch[1]) {
                        const percentage = parseInt(progressMatch[1], 10);
                        setProgress(percentage);
                    }
                }
            }
            else if (data.stdout) {
                console.log("Data.stdout: ", data.stdout);
                setOutput(`Stdout: ${data.stdout}`);
            }  
        });

        window.api.onReportOutput((data) => {
            if (data) {
                console.log('Data properties:', data);
            }
        
            if (data.stderr) {
                console.log("Data.stderr: ", data.stderr);
                if (data.stderr.match(/Execution halted/)) {
                    console.log("STOPPED EXECUTION");
                }
                if (data.stderr.match(/output file/)) {
                    console.log("REPORT PRODUCED");
                }
                const progressMatch = data.stderr.match(/(\d+)%/);
                if (progressMatch) {
                    console.log("Progress match: ", progressMatch);
                    console.log("Progress match[1]: ", progressMatch[1]);
                    if (progressMatch[1]) {
                        const percentage = parseInt(progressMatch[1], 10);
                        setProgress(percentage);
                    }
                }
            }
            else if (data.stdout) {
                console.log("Data.stdout: ", data.stdout);
                setOutput(`Stdout: ${data.stdout}`);
            }
        });

    }, []);

    return(
        <>
        <div className="mt-3">
            <div>
                <Modal.Dialog className="scrollable-modal">
                    <Modal.Header>
                        <Modal.Title>Analysis Output</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{output}</Modal.Body>
                </Modal.Dialog>
            </div>
            <h5>Progress: {progress}%</h5>
            <ProgressBar animated now={progress} label={`${progress}%`} variant="primary" />

            {error.error && (
                <div className="modal show" style={{ display: 'block', position: 'initial' }}>
                <Modal.Dialog className= "modal-danger">
                    <Modal.Header className="modal-danger">
                    <Modal.Title>Error!</Modal.Title>
                    </Modal.Header>
            
                    <Modal.Body className="modal-danger">
                    <p>{error.message}</p>
                    </Modal.Body>
                </Modal.Dialog>
                </div>
            )}

            {typeof progress === 'number' && progress === 100 && (
                <div className="modal show" style={{ display: 'block', position: 'initial' }}>
                <Modal.Dialog className="modal-primary">
                    <Modal.Header className="modal-primary">
                        <Modal.Title>Analysis Successful!</Modal.Title>
                    </Modal.Header>
            
                    <Modal.Body className="modal-primary">
                        <p>Your output files and report have been produced.</p>
                    </Modal.Body>
                </Modal.Dialog>
                </div>
            )}
        </div>
        </>
    )
}