import React from "react";
import { Alert, Button } from "react-bootstrap";

export default function ParametersAlert({formData, setShowAlert, onButtonClick}) {
    return(
        <Alert variant="secondary" className="text-start">
            <Alert.Heading className="text-header">All set!</Alert.Heading>
            <p>
            These are your parameters: <br/>
            ANALYSIS NAME: {formData.NAME} <br/>
            INPUT FOLDER: {formData.INPUT} <br/>
            GENUS: {formData.GENUS} <br/>
            SPECIES: {formData.SPECIES} <br />
            TYPE: {formData.TYPE} <br/>
            {formData.TYPE == "fastq" ? <>PAIRED: {formData.PAIRED} <br/></> : <></>}
            IDENTITY: {formData.IDENTITY} <br/>
            COVERAGE: {formData.COVERAGE}
            </p>
            <hr />
            <div className="d-flex gap-3 justify-content-center z-1000">
                <Button onClick={() => setShowAlert(false)} variant="dark">Back</Button>
                <Button variant="primary" onClick={onButtonClick}>LAUNCH ANALYSIS</Button>
            </div>
        </Alert>
    )
}