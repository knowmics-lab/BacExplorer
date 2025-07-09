import React from "react";
import CheckInstalled from "./Check-Installed";
import EnvSetup from "./Environment-Setup";

export default function DockerConfig(){
    return(
        <div className="custom-container" id="config">
            <div className="text-container">
                <h2 className="text-header">Setup</h2>
                <div className="text-simple">
                This tool uses Docker to perform the analysis. <br />
                Let's make sure you have all set before going on. <br />
                Skip if this is not your first usage.
                </div>
            </div>
            <hr className="line" />
            <div className="text-container">
                <CheckInstalled />
            </div>
            <hr className="line" />
            <div className="text-container">
                <EnvSetup/>
            </div>
        </div>
    )
}