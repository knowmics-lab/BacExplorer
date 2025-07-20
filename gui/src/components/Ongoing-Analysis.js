import React from "react";
import { Button } from "react-bootstrap";

// WIP
// maybe add the button into a modal and make it sticky somewhere on the page

export default function OngoingAnalysis() {
    const handleClick = () => {
        window.api.navigate('analysis');
    }

    return (
        <Button variant="secondary" onClick={handleClick}> BACK TO ANALYSIS </Button>
    )
}