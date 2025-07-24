import React, { useEffect, useState } from "react";
import logo from './logo.png';
import { Stack, Col, Button } from "react-bootstrap";
import OngoingAnalysis from "../Ongoing-Analysis";

export default function Home({containerRunning, setContainerRunning, ongoingAnalysis, resetAllValues}) {
    const [containerMessage, setContainerMessage] = useState("");
    const [defaultButton, setDefaultButton] = useState(true);

    const navigate = (page) =>{
        console.log(`Navigating towards ${page}`);
        window.api.navigate(page);
    }

    const goToAnalysis = () => {
        resetAllValues();
        navigate('settings');
    }

    const handleClick = async () => {
        try {
            console.log("Starting container");
            const response = await window.api.checkContainer();
            if (response === "Container running") {
                setContainerRunning(true);
                setContainerMessage(response);
                setDefaultButton(false);
            }
        } catch (error) {
            setContainerMessage("Unable to run container!");
            setDefaultButton(false);
            setContainerRunning(false);
        }
    }

    const refreshPage = () => {
        setDefaultButton(true);
    }

    useEffect(() => {
        if (containerRunning)
            setDefaultButton(false);
    }, []);

    useEffect(() => {
        console.log("HOME ongoingAnalysis prop:", ongoingAnalysis);
    }, [ongoingAnalysis]);


    return(
        <div className='custom-container home'>
            <img className="img-fluid cover" src={logo} alt="LOGO" />
            {ongoingAnalysis &&
                <div className="position-absolute top-0 start-0 w-100" style={{ zIndex: 1050 }}>
                    <OngoingAnalysis />
                </div>
            }
            <div className='text-container'>
                <h1 className='text-header'>Welcome to BacExplorer!</h1>
                
            </div>
            <Stack direction="horizontal" gap="3" className="justify-content-md-center px-5">
                <Col className="custom-col justify-content-md-center py-5 px-5 mx-5">
                    <h2 className="text-header">First usage?</h2>
                    <p className="text-secondary">Setup the Docker container and read the guide.</p>
                    <div className="d-flex">
                        <Button className="ms-auto" variant="primary" onClick={() => navigate('guide')}>Go to setup</Button>
                    </div>
                </Col>
                <Col className="custom-col justify-content-md-center py-5 px-5 mx-5">
                    <h2 className="text-header">Start analysis</h2>
                    <p className="text-secondary">Skip the setup, launch your analysis.</p>
                    <div className="d-flex">
                        {defaultButton && !containerRunning &&
                            <Button className="ms-auto" variant="secondary" onClick={handleClick}> Start container</Button>
                        }
                        {containerRunning &&
                            <Button className="ms-auto" variant="primary" onClick={goToAnalysis}>Go to analysis</Button>
                        }
                        {!containerRunning && !defaultButton &&
                            <Button className="ms-auto" variant="danger" onClick={refreshPage}>{containerMessage}</Button>
                        }
                    </div>
                </Col>
            </Stack>
        </div>
    )
}