import React from "react";
import { Alert, Button } from "react-bootstrap";

export default function InvalidFolderAlert({setShowAlert, message}) {
    return(
        <Alert variant="danger" className="text-start">
            <Alert.Heading className="text-header">Error!</Alert.Heading>
            <p>{message}</p>
            <hr />
            <div className="d-flex gap-3 justify-content-center z-1000">
                <Button onClick={() => setShowAlert(false)} variant="dark">Back</Button>
            </div>
        </Alert>
    )
}