import React, { useState, useEffect } from "react";

export default function Report(){
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const reportPath = await window.api.pickReportDir();
                console.log("report path is: ", reportPath);
                const content = await window.api.readHtmlFile(reportPath);
                console.log("html content: ", content);
                setHtmlContent(content);
                
                const tempFilePath = await window.api.createTempHtmlFile(content);

                await window.api.openHtmlFile(tempFilePath);

                // shell.openExternal(`file://${tempFilePath}`);
            } catch(error) {
                console.error("Error in fetching report: ", error);
                throw(error);
            }
        }
        fetchReport();
    }, []);
    return null;
}