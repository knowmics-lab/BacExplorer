import React from "react";
import { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import OutputModal from "./Output-Modal";
import ErrorModal from "./Error-Modal";
import SuccessModal from "./Success-Modal";

export default function AnalysisProg({progress, setProgress}) {
    const [output, setOutput] = useState("");
    const [error, setError] = useState({error: false, message: ""});
    const [analysisCompleted, setAnalysisCompleted] = useState(false);
    const [errorReport, setErrorReport] = useState({error: false, message: ""})
    const [reportCreated, setReportCreated] = useState(false);

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
            <OutputModal output={output} />

            <h5>Progress: {progress}%</h5>
            <ProgressBar animated now={progress} label={`${progress}%`} variant="primary" />

            {error.error && (
                <ErrorModal message={error.message} />
            )}

            {typeof progress === 'number' && progress === 100 && (
                <SuccessModal reportCreated={reportCreated}/>
            )}
        </div>
        </>
    )
}