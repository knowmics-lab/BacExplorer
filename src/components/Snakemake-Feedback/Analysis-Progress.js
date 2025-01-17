import React from "react";
import { ProgressBar, Modal } from "react-bootstrap";

export default function AnalysisProg({progress, output}) {

    return(
        <>
        <div className="mt-3">
            <h5>Progress: {progress}%</h5>
            <ProgressBar animated now={progress} label={`${progress}%`} variant="primary" />

            {typeof output === 'string' && output.match(/Snakemake exited with code/) && typeof progress === 'number' && progress !== 100 && (
                <div className="modal show" style={{ display: 'block', position: 'initial' }}>
                <Modal.Dialog className= "modal-danger">
                    <Modal.Header className="modal-danger">
                    <Modal.Title>Error!</Modal.Title>
                    </Modal.Header>
            
                    <Modal.Body className="modal-danger">
                    <p>{output}</p>
                    </Modal.Body>
                </Modal.Dialog>
                </div>
            )}

            {typeof progress === 'number' && progress === 100 && (
                <div className="modal show" style={{ display: 'block', position: 'initial' }}>
                <Modal.Dialog className="modal-primary">
                    <Modal.Header className="modal-primary">
                        <Modal.Title>Analysis Successful!</Modal.Title>
                    </Modal.Header>
            
                    <Modal.Body className="modal-primary">
                        <p>Your output files and report have been produced.</p>
                    </Modal.Body>

                    {/* <Modal.Footer className="modal-primary">
                        <p>Thanks for using BacExplorer!</p>
                    </Modal.Footer> */}
                </Modal.Dialog>
                </div>
            )}
        </div>
        </>
    )
}