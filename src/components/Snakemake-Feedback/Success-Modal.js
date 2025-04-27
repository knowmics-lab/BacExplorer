import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function SuccessModal({reportCreated}) {

    const [htmlContent, setHtmlContent] = useState("");

    const fetchReport = async () => {
        try {
            const reportPath = await window.api.pickReportDir();
            console.log("report path is: ", reportPath);
            const content = await window.api.readHtmlFile(reportPath);
            console.log("html content: ", content);
            setHtmlContent(content);
            
            const tempFilePath = await window.api.createTempHtmlFile(content);

            await window.api.openHtmlFile(tempFilePath);

        } catch(error) {
            console.error("Error in fetching report: ", error);
            throw(error);
        }
    }
    
    const handleClick = () => {
        fetchReport();
    }

    return(
        <div className="modal show" style={{ display: 'block', position: 'initial' }}>
            <Modal.Dialog className="modal-primary">
                <Modal.Header className="modal-primary">
                    <Modal.Title>{!reportCreated ? "Analysis Successful!" : "Workflow completed!"}</Modal.Title>
                </Modal.Header>
        
                <Modal.Body className="modal-primary">
                    <p>{reportCreated ? "Your output files and report have been produced." : "Producing report..."}</p>
                    {reportCreated && (
                        <Button variant="secondary" onClick={()=>handleClick()}>Go to report</Button>
                    )}
                </Modal.Body>
            </Modal.Dialog>
        </div>
    );
}