import React from "react";
import OutputOrg from "./Output_Organization";
import ParamsSet from "./Parameters_Setting";
import TechReq from "./Technical_Requirements";
import NavGuide from "./Nav-Guide";
import CheckInstalled from "./Docker-Configuration/Check-Installed";
import DockerConfig from "./Docker-Configuration/Docker-Config";

export default function Guide(){
    return(
        <div className='custom-container'>
            <div className="container">
                <div className="nav-col">
                    <NavGuide />
                </div>
                <div className="content-col">
                    <div className="row">
                    <DockerConfig />
                    </div>
                    <div className="row">
                    <TechReq />
                    </div>
                    <div className="row">
                    <OutputOrg />
                    </div>
                    <div className="row">
                    <ParamsSet />
                    </div>
                </div>
            </div>
        </div>
    )
}