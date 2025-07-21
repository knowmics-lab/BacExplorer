import React from "react";
import { Button, Alert } from "react-bootstrap";

// WIP
// maybe add the button into a modal and make it sticky somewhere on the page

export default function OngoingAnalysis() {
    const handleClick = () => {
        window.api.navigate('analysis');
    }

    return (
        <Alert
        variant="primary"
        className="d-flex justify-content-center align-items-center gap-3 px-4 py-3 mb-0 rounded-0"
        style={{ zIndex: 1050 }}
        >
            <strong className="mb-0" style={{fontSize:"32px"}}>You have an analysis in progress:</strong>

            <Button variant="secondary" onClick={handleClick}>
                RETURN TO ANALYSIS
            </Button>
        </Alert>

    );
}