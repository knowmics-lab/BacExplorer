import React from "react";
import { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import OutputModal from "./Output-Modal";
import ErrorModal from "./Error-Modal";
import SuccessModal from "./Success-Modal";

export default function AnalysisProg({ setOngoingAnalysis }) {
    // const [progress, setProgress] = useState(() => {
    //     const value = localStorage.getItem("progress");
    //     return value ? JSON.parse(value) : 0;
    // });

    // const [analysisCompleted, setAnalysisCompleted] = useState(() => {
    //     const value = localStorage.getItem("analysisCompleted")
    //     return value ? JSON.parse(value) : false;
    // });

    // const [reportCreated, setReportCreated] = useState(() => {
    //     const value = localStorage.getItem("reportCreated");
    //     return value ? JSON.parse(value) : false;
    // });

    // const [error, setError] = useState(() => {
    //     const value = localStorage.getItem("error");
    //     return value ? JSON.parse(value) : { error: false, message: "" };
    // });

    // const [genomadError, setGenomadError] = useState(() => {
    //     const value = localStorage.getItem("genomadError");
    //     return value ? JSON.parse(value) : { error: false, message: "" };
    // }); 

    // const [output, setOutput] = useState("");
    
    // useEffect(() => {
    //     localStorage.setItem("progress", progress);
    // }, [progress]);

    // useEffect(() => {
    //     localStorage.setItem("analysisCompleted", analysisCompleted);
    // }, [analysisCompleted]);

    // useEffect(() => {
    //     localStorage.setItem("reportCreated", reportCreated);
    // }, [reportCreated]);

    // useEffect(() => {
    //     localStorage.setItem("error", JSON.stringify(error));
    // }, [error]);

    // useEffect(() => {
    //     localStorage.setItem("genomadError", JSON.stringify(genomadError));
    // }, [genomadError]);

    // useEffect(() => {
    //     window.api.onSnakemakeOutput((data) => {
    //         if (data) {
    //             console.log('Data properties:', data);
    //         }

    //         if (data.stderr) {
    //             console.log("Data.stderr: ", data.stderr);
    //             if (data.stderr.match(/(Error|Exception|Traceback)/) && !data.stderr.match(/(Error in library|markdown)/)) {
    //                 setError({ error: true, message: `Error: ${data.stderr}` });
    //                 console.error("STOPPED EXECUTION");
    //                 setOngoingAnalysis(false);
    //                 if (data.stderr.match(/(genomad.py)/)) {
    //                     setGenomadError({ error: true, message: "Analysis was successfull, but genomad will be omitted in report." });
    //                 }
    //                 return;
    //             }
    //             if (data.stderr.match(/Workflow completed: Snakemake exited with code 0/)) {
    //                 setOutput(`${data.stderr}`);
    //                 setError({ error: false, message: "" });
    //                 console.log("ANALYSIS COMPLETED. Producing report...");
    //                 setAnalysisCompleted(true);
    //                 window.api.launchReport();
    //                 return;
    //             }
    //             else {
    //                 setOutput(`${data.stderr}`);
    //             }
    //             const progressMatch = data.stderr.match(/(\d+)%/);
    //             if (progressMatch) {
    //                 console.log("Progress match: ", progressMatch);
    //                 console.log("Progress match[1]: ", progressMatch[1]);
    //                 if (progressMatch[1]) {
    //                     const percentage = parseInt(progressMatch[1], 10);
    //                     setProgress(percentage);
    //                 }
    //             }
    //         }
    //         else if (data.stdout) {
    //             console.log("Data.stdout: ", data.stdout);
    //             setOutput(`${data.stdout}`);
    //         }
    //         if (analysisCompleted) {
    //             window.api.launchReport();
    //         }
    //     });

    //     window.api.onReportOutput((data) => {
    //         if (data) {
    //             console.log('Data properties:', data);
    //         }

    //         if (data.stderr) {
    //             console.log("Data.stderr: ", data.stderr);
    //             if (data.stderr.match(/Execution halted/)) {
    //                 console.error("STOPPED EXECUTION");
    //                 setOngoingAnalysis(false);
    //                 setError({ error: true, message: `Error in producing report: ${data.stderr}` });
    //             }
    //             if (data.stderr.match(/Output created/)) {
    //                 console.log("REPORT PRODUCED");
    //                 setReportCreated(true);
    //                 setOngoingAnalysis(false);
    //             }
    //         }
    //         else if (data.stdout) {
    //             console.log("Data.stdout: ", data.stdout);
    //             setOutput(`${data.stdout}`);
    //         }
    //     });

    // }, []);
    
    const [progress, setProgress] = useState(0);
    const [analysisCompleted, setAnalysisCompleted] = useState(false);
    const [reportCreated, setReportCreated] = useState(false);
    const [error, setError] = useState({ error: false, message: "" });
    const [genomadError, setGenomadError] = useState({ error: false, message: "" });
    const [output, setOutput] = useState("");
    
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(parseInt(localStorage.getItem("progress") || 0));
            setAnalysisCompleted(JSON.parse(localStorage.getItem("analysisCompleted") || false));
            setReportCreated(JSON.parse(localStorage.getItem("reportCreated") || false));
            setError(JSON.parse(localStorage.getItem("error") || '{"error":false,"message":""}'));
            setGenomadError(JSON.parse(localStorage.getItem("genomadError") || '{"error":false,"message":""}'));
            setOutput(localStorage.getItem("lastOutput") || "");
        }, 150);

        return () => clearInterval(interval);
    }, []);


    return (
        <>
            <div className="mt-3">
                <OutputModal output={output} />

                <h5>Progress: {progress}%</h5>
                <ProgressBar animated now={progress} label={`${progress}%`} variant="primary" />

                {error.error && (
                    <ErrorModal message={error.message} errorType="General error" />
                )}

                {genomadError.error && (
                    <ErrorModal message={genomadError.message} errorType="Genomad" />
                )}

                {typeof progress === 'number' && progress === 100 && (
                    <SuccessModal reportCreated={reportCreated} />
                )}
            </div>
        </>
    )
}