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
        // const platform = os.platform();
        // let link;
        // if (platform === "win32") {
        //     link = "https://docs.docker.com/desktop/setup/install/windows-install/";
        // } else if (platform === "darwin") {
        //     link = "https://docs.docker.com/desktop/setup/install/mac-install/";
        // } else if (platform === "linux") {
        //     link = "https://docs.docker.com/engine/install/ubuntu/";
        // }
        // const link = "https://docs.docker.com/engine/install/";
        // console.log("Opening: ", link);
        const link = "docker-install";
        window.api.openExternalLink(link);
    };

    return (
        <div className="text-simple">
            <b>Docker not found: click <a className="text-emphasis" onClick={openLinkExternally}>here</a> to install.</b>
            {/* <b>Docker not found: click <a className="text-emphasis" href={link}>here</a> to install.</b> */}

        </div>
    )
}