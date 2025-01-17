import React from "react";
import { InputGroup } from "react-bootstrap";
import { Form } from "react-bootstrap";

export default function Type({formData, setFormData}){
    const handleTypeChange = e => {
        const {value} = e.target;
        setFormData(prevData => ({
            ...prevData,
            TYPE:value,
        }));
    }

    const handlePairedSet = e => {
        const {value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            PAIRED:value,
        }));
    }

    return( 
        <>
            <h1 className="pb-3 text-header">Set Input Type</h1>
            <InputGroup className="mb-3">
                <InputGroup.Text>Type</InputGroup.Text>
                <Form.Select className="z-0" required aria-label="Type" value={formData.TYPE} onChange={handleTypeChange}>
                    <option value="">Choose your Input Type</option>
                    <option value="fasta">Fasta</option>
                    <option value="fastq">Fastq</option>
                </Form.Select>
                <Form.Control.Feedback className="z-0" type='invalid'>Type is required</Form.Control.Feedback>
            </InputGroup>
            
            <InputGroup className="mb-3 align-items-center gap-3">
                <InputGroup.Text>Paired</InputGroup.Text>
                <div className="d-flex gap-3">
                    <Form.Check className="z-0" type='radio' id='Yes' label='Yes' value="yes" onChange={handlePairedSet}
                    checked={formData.PAIRED==="yes"} disabled={formData.TYPE === 'fasta' || formData.TYPE === ""}/>
                    <Form.Check className="z-0" type='radio' id='No' label='No' value="no" onChange={handlePairedSet}
                    checked={formData.PAIRED === "no"}disabled={formData.TYPE === 'fasta' || formData.TYPE === ""}/>
                </div>
                
            </InputGroup>
        </>
    )
}