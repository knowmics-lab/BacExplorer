import React, { useEffect, useState } from 'react';
import Guide from './components/Guide/Guide.js';
import Inputs from './components/Settings/Inputs.js';
import "./renderer.js";
import DockerConfig from './components/Guide/Docker-Configuration/Docker-Config.js';
import Home from './components/HomePage/Home.js';
import AnalysisPage from './components/Snakemake-Feedback/Analysis-Page.js';

export default function App() {
    const [formData, setFormData] = useState({
        NAME: '',
        GENUS: null,
        SPECIES: '',
        TYPE: '',
        PAIRED: 'yes',
        INPUT: 'No Folder Selected',
        IDENTITY: 90,
        COVERAGE: 90,
        THREADS_NUMBER: 2,
        GENOMAD_ANALYSIS: 'yes',
    });

    // not working
    // const [containerRunning, setContainerRunning] = useState(() => {
    //     const value = localStorage.getItem("containerRunning")
    //     return value ? value === "true" : false;
    // });

    const [containerRunning, setContainerRunning] = useState(false);
    
    const [currentPage, setCurrentPage] = useState('home');

    // localStorage variable to define if an analysis is in progress
    const [ongoingAnalysis, setOngoingAnalysis] = useState(() => {
        const value = localStorage.getItem("ongoingAnalysis")
        return value ? value === "true" : false;
    });

    // const [ongoingAnalysis, setOngoingAnalysis] = useState(false);

    const resetAllValues = () => {
        if (!ongoingAnalysis) {
            console.log("Resetting all values in localStorage");
            localStorage.setItem("analysisCompleted", "false");
            localStorage.setItem("reportCreated", "false");
            localStorage.setItem("lastOutput", "");
            localStorage.setItem("progress", 0);
            localStorage.setItem("error", JSON.stringify({ error: false, message: "" }));
            localStorage.setItem("genomadError", JSON.stringify({ genomadError: false, message: "" }));
        }
    };

    useEffect(() => {
        const handleNavigate = (event) => {
            if (event) {
                setCurrentPage(event);  
            } else {
                console.error(`Error: page ${page} is undefined`);
            }
        };
    
        window.api.on('navigate', handleNavigate);

        return () => {
            window.api.off('navigate', handleNavigate);
        };
    }, [currentPage]);

    useEffect(() => {
        localStorage.setItem("ongoingAnalysis", ongoingAnalysis);
    }, [ongoingAnalysis]);

    useEffect(() => {
        localStorage.setItem("containerRunning", containerRunning);
    }, [containerRunning]);

    useEffect(() => {
        setContainerRunning(false);
        setOngoingAnalysis(false);
        console.log("App started: cleaning localStorage");
        // localStorage.setItem("containerRunning", "false");
        localStorage.setItem("ongoingAnalysis", "false");
        resetAllValues();
    }, []);

    useEffect(() => {
        if (window.api?.receive) {
            window.api.receive('app-closing', resetAllValues);
            // localStorage.setItem("containerRunning", "false");
            localStorage.setItem("ongoingAnalysis", "false");
            setTimeout(() => {
                console.log("LocalStorage cleaned, notifying main...");
                window.api.send('localStorage-cleaned');
            }, 100);
        } else {
            console.error("window.api.receive not available");
        }
    }, []);

    useEffect(() => {
        const handleSnakemakeOutput = (data) => {
            if (data?.stderr) {
                const errorMatch = /(Error|Exception|Traceback)/.test(data.stderr) && !/Error in library|markdown/.test(data.stderr);
                // catch exact Snakemake output at the end of a job: ex. 1 of 25 steps (4%) done
                const progressMatch = data.stderr.match(/(\d+)\s+of\s+(\d+)\s+steps\s+\((\d+)%\)\s+done/i);

                if (errorMatch) {
                    localStorage.setItem("error", JSON.stringify({ error: true, message: `Error: ${data.stderr}` }));
                    if (/genomad.py/.test(data.stderr)) {
                        localStorage.setItem("genomadError", JSON.stringify({ error: true, message: "Analysis was successful, but genomad will be omitted." }));
                    }
                    setOngoingAnalysis(false);
                    return;
                } else if (/Workflow completed.*code 0/.test(data.stderr)) {
                    localStorage.setItem("analysisCompleted", true);
                    setOngoingAnalysis(true);
                    console.log("Launching report");
                    window.api.launchReport();
                    return;
                } else if (progressMatch) {
                    const percentage = parseInt(progressMatch[3], 10);
                    localStorage.setItem("progress", percentage);
                } else {
                    localStorage.setItem("lastOutput", data.stderr);
                }

            }

            if (data?.stdout) {
                localStorage.setItem("lastOutput", data.stdout);
            }
        };

        const handleReportOutput = (data) => {
            if (data?.stderr) {
                if (/Execution halted/.test(data.stderr)) {
                    localStorage.setItem("error", JSON.stringify({ error: true, message: `Report generation failed: ${data.stderr}` }));
                    setOngoingAnalysis(false);
                }
                if (/Output created/.test(data.stderr)) {
                    localStorage.setItem("reportCreated", true);
                    setOngoingAnalysis(false);
                }
            }
            if (data?.stdout) {
                localStorage.setItem("lastOutput", data.stdout);
            }
        };

        window.api.onSnakemakeOutput(handleSnakemakeOutput);
        window.api.onReportOutput(handleReportOutput);

        return () => {
            window.api.off('onSnakemakeOutput', handleSnakemakeOutput);
            window.api.off('onReportOutput', handleReportOutput);
        };
    }, []);


 
    const renderContent = () => {
        switch(currentPage) {
            case 'home':
                return <Home containerRunning={containerRunning} setContainerRunning={setContainerRunning} ongoingAnalysis={ongoingAnalysis}
                resetAllValues={resetAllValues}/>;
            case 'guide':
                return <Guide ongoingAnalysis={ongoingAnalysis} />;
            case 'config':
                return <DockerConfig />;
            case 'settings':
                return <Inputs formData={formData} setFormData={setFormData} ongoingAnalysis={ongoingAnalysis}/>;
            case 'analysis':
                return <AnalysisPage formData={formData} ongoingAnalysis={ongoingAnalysis} setOngoingAnalysis={setOngoingAnalysis} />;
            // case 'report':
            //     return <Report />;
            default:
                return <Home />;
        }
    }

    return(
        <>{renderContent()}</>     
    )
}
