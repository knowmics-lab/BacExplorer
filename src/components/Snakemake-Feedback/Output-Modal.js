import React from "react";
import { Modal } from "react-bootstrap";

export default function OutputModal({output}) {
    return(
        <div>
            <Modal.Dialog className="scrollable-modal">
                <Modal.Header>
                    <Modal.Title>Analysis Output</Modal.Title>
                </Modal.Header>
                <Modal.Body>{output}</Modal.Body>
            </Modal.Dialog>
        </div>
    );
}