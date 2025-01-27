import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";

export default function EnvSetup() {
    const [isCreating, setIsCreating] = useState(false);
    const [status, setStatus] = useState({ created: false, error: false });
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState("");

    useEffect(() => {
        window.api.on('progress', (data) => {
            setProgress(data.progress);
            setCurrentStage(data.status);
        });
    
        return () => {
            window.api.removeAllListeners('progress');
        };
    }, []);
    

    const handleClick = async () => {
        if (isCreating) return;

        if (status.error) {
            setProgress(0);
            setCurrentStage("");
            window.location.reload();
            return;
        }

        setIsCreating(true);
        setStatus({ created: false, error: false });
        setProgress(0);

        try {
            const response = await window.api.createEnv();
            console.log(response);
            setStatus({ created: true, error: false });
        } catch (error) {
            console.error("Error: ", error);
            setStatus({ created: false, error: true });
            setError(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="text-container">
            <h2 className="text-header">2. Environment Setup</h2>
            <div className="text-simple">
                Once you have Docker installed, <b>run it</b>.<br />
                Then click <a className="text-emphasis" onClick={handleClick}>here</a> to setup the environment.
            </div>
            {isCreating && (
                <>
                    <ProgressBar animated now={progress} label={`${progress}%`} />
                    <div>{currentStage}</div>
                </>
            )}
            {!isCreating && status.created && (
                <div className="text-simple primary">
                    <b>Environment successfully created!</b><br />
                    You are now ready to launch your analysis.
                </div>
            )}
            {!isCreating && status.error && (
                <div className="text-simple" style={{ color: "red" }}>Something went wrong! {error}</div>
            )}
        </div>
    );
}