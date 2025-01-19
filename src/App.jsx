import React, { useEffect, useState } from 'react';
import Guide from './components/Guide/Guide.js';
import Inputs from './components/Settings/Inputs.js';
import Report from './components/Report.js';
import "./renderer.js";
import DockerConfig from './components/Guide/Docker-Configuration/Docker-Config.js';

export default function App() {
    const [currentPage, setCurrentPage] = useState('guide');

    console.log("Ciao da app");

    useEffect(() => {
        const handleNavigate = (event) => {
            console.log("Navigazione ricevuta in App.jsx:");
            console.log("Event:", event); // Questo dovrebbe essere l'oggetto evento IPC
            // console.log("Page:", page);   // Questo deve essere 'settings', 'guide', ecc.
    
            if (event) {
                setCurrentPage(event);
            } else {
                console.error("Errore: Page è undefined!");
            }
        };
    
        // Ascolta il messaggio dal main process
        window.api.on('navigate', handleNavigate);

        // Cleanup dell'evento per evitare listener multipli
        return () => {
            window.api.off('navigate', handleNavigate);
        };
    }, [currentPage])

    useEffect(() => {
        console.log("Stato corrente aggiornato:", currentPage);
    }, [currentPage]);

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
