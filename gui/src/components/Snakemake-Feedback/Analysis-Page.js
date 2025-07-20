import React, { useState, useEffect }       from 'react';
import { Button, Spinner } from 'react-bootstrap';
import AnalysisProg                         from '../Snakemake-Feedback/Analysis-Progress';

export default function AnalysisPage({formData, setOnGoingAnalysis}) {
    const [progress, setProgress] = useState(0);
    const [isAnalysing, setIsAnalysing] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [prepOutput, setPrepOutput] = useState({ error: false, message: "" });
    
    const handleAnalysis = async () => {
        setIsPreparing(true);
        try {
            await window.api.prepareSnakemake(formData.INPUT);
            setIsPreparing(false);
            setIsAnalysing(true);
            window.api.launchAnalysis();
            setOnGoingAnalysis(true);
        } catch(error) {
            console.error("Error while preparing analysis: ", error);
            setIsPreparing(false);
            setIsBlocked(true);
        }
    };

    useEffect(() => {
        handleAnalysis();
    }, []);

    useEffect(() => {
        window.api.onSnakemakeOutput((data) => {
          console.log('Received data from Snakemake: ', data);
    
          if(data.isError) {
            setPrepOutput({error: true, message: `Stderr: ${data.stderr}`});
            setIsBlocked(true);
          }
        });
    }, []);
    

    return (
        <div className="custom-container d-flex flex-column min-vh-100">
    
          {isPreparing && !isBlocked && (
    
            <div className="position-fixed top-50 start-50 translate-middle">
              <Button disabled className="text-primary" style={{backgroundColor: "transparent", border: "none"}}>
                <Spinner className="text-primary" as="span" animation="grow" role="status" aria-hidden="true"/> <b>Preparing for Snakemake...</b></Button>
            </div>
          )}
          {isPreparing && isBlocked && (
            <Button className="position-fixed top-50 start-50 translate-middle w-25" disabled variant="danger">
              {prepOutput.message}</Button>
          )}
    
          {isAnalysing && (
            <div className="position-fixed top-50 start-50 translate-middle z-3 w-75">
              {/* <AnalysisProg progress={progress} setProgress={setProgress} message={output.message} error={output.error}/> */}
              <AnalysisProg progress={progress} setProgress={setProgress}/>
            </div>
          )}
        </div>
    );
}