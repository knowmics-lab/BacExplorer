import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Install from "./Install";

export default function CheckInstalled() {
    const [isInstalled, setIsInstalled] = useState(false);
    const [needsInstalling, setNeedsInstalling] = useState(false);
    const [dockerLink, setDockerLink] = useState("");

    const handleClick = async () => {
        try {
            const response = await window.api.checkDockerInstalled();
            console.log(response);
            if (response == "Docker is installed") {
                setIsInstalled(true);
            } else {
                setNeedsInstalling(true);
                setDockerLink(response);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <div className="text-container">
            <h2 className="text-header">1. Docker installation</h2>
            <Button variant="primary" onClick={handleClick}>Check</Button>
            {isInstalled && (
                <div className="text-simple"><b>Docker installed! Go on.</b></div>
            )}
            {needsInstalling && (
            <Install link={dockerLink}/>
            )}
        </div>
    )
}