import React from "react";
import { Button } from "react-bootstrap";


export default function Install({link}){
    const handleClick = async() => {
        const response = window.api.installDocker();
        if (response.success) {
            console.log("Docker Installed");
        } else {
            console.log(response.error);
        }
    }

    const openLinkExternally = () => {
        // const link = "docker-install";
        window.api.openExternalLink();
    };

    return (
        <div className="text-simple">
            <b>Docker not found: click <a className="text-emphasis" onClick={openLinkExternally}>here</a> to install.</b>
            {/* <b>Docker not found: click <a className="text-emphasis" href={link}>here</a> to install.</b> */}

        </div>
    )
}