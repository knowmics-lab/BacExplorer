import React from "react";
import { InputGroup } from "react-bootstrap";
import { Form, FormControl } from "react-bootstrap";

export default function TecnhicalSettings({formData, setFormData}){
    const handleThreadsChange = e => {
        const {value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            THREADS_NUMBER: value,
        }));
    }

    const handleGenomadChange = e => {
        const {value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            GENOMAD_ANALYSIS: value,
        }));
    }


    return(
        <>
            <h1 className="text-header pb-3">Technical Settings</h1>
            <div className="text-secondary">Modify only if you are aware of your machine's specs. Otherwise stick to the default values.</div>
            <InputGroup className="my-3 align-items-center">
                <InputGroup.Text htmlFor="threads">Threads</InputGroup.Text>
                <Form.Control className="z-0" type='number' id='threads' value={formData.THREADS_NUMBER} onChange={handleThreadsChange} />
            </InputGroup>
            <InputGroup className="mb-3 align-items-center gap-3">
                <InputGroup.Text>Genomad Analysis</InputGroup.Text>
                <div className="d-flex gap-3">
                    <Form.Check className="z-0" type='radio' id='Yes' label='Yes' value="yes" onChange={handleGenomadChange}
                    checked={formData.GENOMAD_ANALYSIS==="yes"} defaultChecked/>
                    <Form.Check className="z-0" type='radio' id='No' label='No' value="no" onChange={handleGenomadChange}
                    checked={formData.GENOMAD_ANALYSIS === "no"}/>
                </div>
                
            </InputGroup>
        </> 
    )
}