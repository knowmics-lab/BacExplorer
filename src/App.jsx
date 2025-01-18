import React, { useEffect, useState } from 'react';
import Guide from './components/Guide/Guide.js';
import Inputs from './components/Settings/Inputs.js';
import Report from './components/Report.js';
import "./renderer.js";
import DockerConfig from './components/Guide/Docker-Configuration/Docker-Config.js';

export default function App() {
    const [currentPage, setCurrentPage] = useState('guide');

    useEffect(() => {
        window.api.onNavigate(page => {
            console.log("Page: ", page);
            setCurrentPage(page);
        })

        const errorButton = document.getElementById('ErrorBtn');
        if (errorButton) {
            errorButton.addEventListener('click', window.api.openErrorDialog);
        }

        return () => {
            if (errorButton) {
                errorButton.removeEventListener('click', window.api.openErrorDialog);
            }
        };
    }, [currentPage])

    const renderContent = () => {
        switch(currentPage) {
            case 'guide':
                return <Guide />;
            case 'config':
                return <DockerConfig />;
            case 'settings':
                return <Inputs />;
            case 'report':
                // return <Report />;
            default:
                // return <DockerConfig />;
                return <Guide />;
        }
    }

    return(
        // <div class='custom-container'>
        //     {renderContent()}
        // </div> 
        <>{renderContent()}</>     
    )
}
