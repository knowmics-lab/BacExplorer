import React, { useState, useEffect } from "react";
// import htmlFile from '../../../../snakemake/Report.html';

// const reportPath = window.api.pickReportDir();

// import htmlFile from {reportPath};


//prendi l'input data dalla cartella userData e restituisci il report dentro output

export default function Report(){
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
        const reportPath = await window.api.pickReportDir(); // Ottieni il percorso del file HTML
        const content = await window.api.readHtmlFile(reportPath); // Leggi il contenuto del file
        setHtmlContent(content); // Aggiorna lo stato
        };

        fetchReport();
    }, []);
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="custom-container"/>;
}