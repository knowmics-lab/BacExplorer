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
        PAIRED: '',
        INPUT: 'No Folder Selected',
        IDENTITY: 90,
        COVERAGE: 90,
        THREADS_NUMBER: 2,
        GENOMAD_ANALYSIS: 'yes',
    });

    const [containerRunning, setContainerRunning] = useState(false);
    
    const [currentPage, setCurrentPage] = useState('home');

    // STATE VARIABLE TO DEFINE IF THERE IS AN ONGOING ANALYSIS. FRONTEND TO DEVELOP YET
    const [ongoingAnalysis, setOngoingAnalysis] = useState(true);

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
    }, [currentPage])

    useEffect(() => {
    }, [currentPage]);

    const renderContent = () => {
        switch(currentPage) {
            case 'home':
                return <Home containerRunning={containerRunning} setContainerRunning={setContainerRunning} ongoingAnalysis={ongoingAnalysis} />;
            case 'guide':
                return <Guide ongoingAnalysis={ongoingAnalysis} />;
            case 'config':
                return <DockerConfig />;
            case 'settings':
                return <Inputs formData={formData} setFormData={setFormData} />;
            case 'analysis':
                return <AnalysisPage formData={formData} setOngoingAnalysis={setOngoingAnalysis} />;
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
