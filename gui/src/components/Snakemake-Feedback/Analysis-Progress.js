import React from "react";
import { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import OutputModal from "./Output-Modal";
import ErrorModal from "./Error-Modal";
import SuccessModal from "./Success-Modal";

export default function AnalysisProg() {
     
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