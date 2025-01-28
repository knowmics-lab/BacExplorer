import React from "react";
import { useState, useEffect } from "react";
import { ProgressBar, Modal, Button } from "react-bootstrap";

export default function AnalysisProg({progress, setProgress}) {
    const [output, setOutput] = useState("");
    const [error, setError] = useState({error: false, message: ""});
    const [analysisCompleted, setAnalysisCompleted] = useState(false);
    const [errorReport, setErrorReport] = useState({error: false, message: ""})
    const [reportCreated, setReportCreated] = useState(false);
    const [htmlContent, setHtmlContent] = useState("");
    
    const fetchReport = async () => {
        try {
            const reportPath = await window.api.pickReportDir();
            console.log("report path is: ", reportPath);
            const content = await window.api.readHtmlFile(reportPath);
            console.log("html content: ", content);
            setHtmlContent(content);
            
            const tempFilePath = await window.api.createTempHtmlFile(content);

            await window.api.openHtmlFile(tempFilePath);

        } catch(error) {
            console.error("Error in fetching report: ", error);
            throw(error);
        }
    }
    
    const handleClick = () => {
        fetchReport();
    }

    useEffect(() => {
        window.api.onSnakemakeOutput((data) => {
            if (data) {
            console.log('Data properties:', data);
            }

            if (data.stderr) {
                console.log("Data.stderr: ", data.stderr);
                if (data.stderr.match(/WorkflowError/) || data.stderr.match(/IncompleteFilesException/)) {
                    setError({error: true, message: `Error: ${data.stderr}`});
                    console.log("STOPPED EXECUTION");
                    return;
                }
                if (data.stderr.match(/Workflow completed: Snakemake exited with code 0/)) {
                    setOutput(`${data.stderr}`);
                    console.log("ANALYSIS COMPLETED. Producing report...");
                    setAnalysisCompleted(true);
                    window.api.launchReport();
                }
                else {
                    setOutput(`${data.stderr}`);
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
                setOutput(`${data.stdout}`);
            }
            if(analysisCompleted) {
                window.api.launchReport();
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
                    setErrorReport({error: true, message: `Error in report production: ${data.stderr}`});
                }
                if (data.stderr.match(/output file/)) {
                    console.log("REPORT PRODUCED");
                    setReportCreated(true);
                }
            }
            else if (data.stdout) {
                console.log("Data.stdout: ", data.stdout);
                setOutput(`${data.stdout}`);
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
                        <Modal.Title>{!reportCreated ? "Analysis Successful!" : "Workflow completed!"}</Modal.Title>
                    </Modal.Header>
            
                    <Modal.Body className="modal-primary">
                        <p>{reportCreated ? "Your output files and report have been produced." : "Producing report..."}</p>
                        {reportCreated && (
                            <Button variant="secondary" onClick={()=>handleClick()}>Go to report</Button>
                        )}
                    </Modal.Body>
                </Modal.Dialog>
                </div>
            )}
        </div>
        </>
    )
}