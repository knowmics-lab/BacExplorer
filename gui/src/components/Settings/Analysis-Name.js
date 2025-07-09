import React from "react";
import { Form, FormControl } from "react-bootstrap";

export default function AnalysisName({formData, setFormData}){
    const handleNameChange = e => {
        const {value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            NAME: value,
        }));
    }

    return(
        <>
            <h1 className="text-header">Name your analysis</h1>
            <Form.Control className="z-0" type="text" placeholder="My Analysis" value={formData.NAME} onChange={handleNameChange}/>
            <FormControl.Feedback className="z-0" type='invalid'>Analysis Name is required</FormControl.Feedback>
        </> 
    )
}