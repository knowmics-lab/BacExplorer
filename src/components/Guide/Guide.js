import React from "react";
import logo from './logo.png';
import OutputOrg from "./Output_Organization";
import ParamsSet from "./Parameters_Setting";
import TechReq from "./Technical_Requirements";
import NavGuide from "./Nav-Guide";
import CheckInstalled from "./Docker-Configuration/Check-Installed";
import DockerConfig from "./Docker-Configuration/Docker-Config";

export default function Guide(){
    return(
        <div className='custom-container'>
            <img className="img-fluid cover" src={logo} alt="LOGO"/>
            <div className='text-container'>
                <h1 className='text-header'>Welcome to BacExplorer!</h1>
                <div className="text-simple">Read the following guide for a correct use of the tool.<br/>
                <span className="text-emphasis"> If this is your first usage, please read carefully the Setup section.</span></div>
            </div>

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