import React, { useState } from "react";
import logo from './logo.png';
import { Stack, Col, Button } from "react-bootstrap";

export default function Home() {

    const [containerRunning, setContainerRunning] = useState(false);
    const [containerMessage, setContainerMessage] = useState("");
    const [defaultButton, setDefaultButton] = useState(true);

    const navigate = (page) =>{
        console.log(`Navigando verso ${page}`);
        window.api.onNavigate(page);
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
            setContainerMessage("! Unable to run container !");
            setDefaultButton(false);
            setContainerRunning(false);
        }
    }

    return(
        <div className='custom-container home'>
            <img className="img-fluid cover" src={logo} alt="LOGO"/>
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
                        {defaultButton &&
                            <Button className="ms-auto" variant="secondary" onClick={handleClick}> Start container</Button>
                        }
                        {containerRunning &&
                            <Button className="ms-auto" variant="primary" onClick={() => navigate('settings')}>Go to analysis</Button>
                        }
                        {!containerRunning && !defaultButton &&
                            <p className="ms-auto" style={{color:"red"}}>{containerMessage}</p>
                        }
                    </div>
                </Col>
            </Stack>

            {/* test report without launching analysis */}
            {/* <Button onClick={() => handleClick()}>Go to Report</Button> */}
            
        </div>
    )
}