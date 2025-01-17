import React from "react";
import Form from 'react-bootstrap/Form';
import ImportGroup, { InputGroup } from 'react-bootstrap';

export default function GenusSpe({formData, setFormData}){
    const genusSpeciesMap = {
        Undefined: ["undefined"],
        Escherichia: ["", "coli"],
        Klebsiella: ["", "pneumoniae", "aerogenes", "oxytoca"],
        Streptococcus: ["", "pyogenes", "pneumoniae"],
        Haemophilus: ["", "influenzae"],
        Staphylococcus: ["", "aureus"],
        Shigella: [""],
        Listeria: [""],
        Legionella: ["pneumophyla", ""],
        Neisseria: ["gonorrhoeae", "meningitidis"],
        Acinetobacter: ["baumannii"],
        Burkholderia: ["cepacia", "pseudomallei"],
        Citrobacter: ["freundii"],
        Clostridioides: ["difficile"],
        Enterobacter: ["cloacae", "asburiae"],
        Enterococcus: ["faecalis", "faecium"],
        Pseudomonas: ["aeruginosa"],
        Serratia: ["marcescens"],
        Vibrio: ["cholerae", "vulfinicus", "parahaemolyticus"],
        Campylobacter: [""],
        Salmonella: [""]
    }

    const genusOptions = Object.keys(genusSpeciesMap);
    const speciesOptions = formData.GENUS ? genusSpeciesMap[formData.GENUS] : [];

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
            <div>Fill if all your files refer to the same Genus and Species. Otherwise leave blank.</div>
            
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
                <Form.Select className="z-0" aria-label="Species" value={formData.SPECIES} onChange={handleSpecChange} disabled={formData.GENUS == "Undefined"}>
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