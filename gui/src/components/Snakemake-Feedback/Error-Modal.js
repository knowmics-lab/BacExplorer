import React from "react";
import { Modal } from "react-bootstrap";

export default function ErrorModal({ message, errorType }) {
    return (
        <div className="modal show" style={{ display: 'block', position: 'initial' }}>
            <Modal.Dialog className="modal-danger">
                <Modal.Header className="modal-danger">
                    <Modal.Title> {errorType === "Genomad" ? "Genomad Error" : "Error!"} </Modal.Title>
                </Modal.Header>

                <Modal.Body className="modal-danger">
                    <p>{message}</p>
                </Modal.Body>
            </Modal.Dialog>
        </div>
    );
}