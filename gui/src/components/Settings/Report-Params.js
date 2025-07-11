import React from "react";
import { Form, InputGroup } from "react-bootstrap";

export default function ReportParams({formData, setFormData}){
    const handleIdentityChange = e => {
        const {value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            IDENTITY:value,
        }));
        console.log('New identity: %d', formData.IDENTITY);
    }

    const handleCoverageChange = e => {
        const {value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            COVERAGE:value,
        }));
        console.log('New identity: %d', formData.COVERAGE);
    }

    return(
        <>
            <h1 className="text-header">Report Parameters: Identity and Coverage</h1>
            <InputGroup className="mt-3">
                <InputGroup.Text htmlFor="identity">Identity</InputGroup.Text>
                <Form.Control className="z-0" type='number' id='identity' value={formData.IDENTITY} onChange={handleIdentityChange}/>
                <InputGroup.Text htmlFor="coverage">Coverage</InputGroup.Text>
                <Form.Control className="z-0" type='number' id='coverage' value={formData.COVERAGE} onChange={handleCoverageChange}/>
            </InputGroup>                      
        </> 
    )
}