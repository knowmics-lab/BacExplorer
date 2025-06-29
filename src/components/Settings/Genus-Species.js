import React, { useEffect, useState } from "react";
import Form from 'react-bootstrap/Form';
import { InputGroup } from 'react-bootstrap';

export default function GenusSpe({ formData, setFormData }) {
    const [genusDict, setGenusDict] = useState({ "": "" });
    const [error, setError] = useState(false);

    useEffect(() => {
        window.api.openGenusList()
            .then(result => setGenusDict(prev => ({ "": "", ...result })))
            .catch(err => {
                console.error(err);
                setError(true);
            });            
    }, []);

    if (!genusDict) return <div>Loading Dictionary... </div>
    if (error) return <div>Error in loading Dictionary: {error}</div>

    const genusOptions = Object.keys(genusDict);
    const speciesOptions = formData.GENUS ? genusDict[formData.GENUS] : [];  

    const handleGenusChange = e => {
        const {value} = e.target;
        setFormData(prevData => ({
            ...prevData,
            GENUS: value,
        }));
    }

    const handleSpecChange = e => {
        const {value} = e.target;
        setFormData(prevData => ({
            ...prevData,
            SPECIES: value,
        }));
    }
    return(
        <>
            <h1 className='pb-3 text-header'>Select genus and species</h1>
            <div className="text-secondary">Fill if all your files refer to the same Genus and Species. Otherwise leave blank.</div>

            <InputGroup className="mt-3">
                <InputGroup.Text>Genus</InputGroup.Text>
                <Form.Select className="z-0" aria-label="Genus" value={formData.GENUS} onChange={handleGenusChange}>
                    {genusOptions.map((genus) => (
                    <option key={genus} value={genus}>
                        {genus}
                    </option>
                    ))}
                </Form.Select>

                <InputGroup.Text>Species</InputGroup.Text>
                <Form.Select className="z-0" aria-label="Species" value={formData.SPECIES} onChange={handleSpecChange} disabled={!formData.GENUS} >
                    {speciesOptions.map((species) => (
                    <option key={species} value={species}>
                        {species}
                    </option>
                    ))}
                </Form.Select>
            </InputGroup>
        </>
          
    )
}