import React, { useEffect, useState } from 'react';
import Guide from './components/Guide/Guide.js';
import Inputs from './components/Settings/Inputs.js';
import Report from './components/Report.js';
import "./renderer.js";
import DockerConfig from './components/Guide/Docker-Configuration/Docker-Config.js';
import Home from './components/HomePage/Home.js';

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');


    useEffect(() => {
        const handleNavigate = (event) => {    
            if (event) {
                setCurrentPage(event);
            } else {
                console.error("Errore: Page è undefined!");
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
                return <Home />;
            case 'guide':
                return <Guide />;
            case 'config':
                return <DockerConfig />;
            case 'settings':
                return <Inputs />;
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
