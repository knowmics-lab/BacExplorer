import React, { useState, useEffect }       from 'react';
import { Button, Spinner } from 'react-bootstrap';
import AnalysisProg                         from '../Snakemake-Feedback/Analysis-Progress';

export default function AnalysisPage({formData, ongoingAnalysis, setOngoingAnalysis}) {

  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [prepOutput, setPrepOutput] = useState({ error: false, message: "" });
  
  const handleAnalysis = async () => {
    setIsPreparing(true);
    setOngoingAnalysis(true);

    try {
      console.log(formData);
      await window.api.prepareSnakemake(formData.INPUT);
      setIsPreparing(false);
      setIsAnalysing(true);
      window.api.launchAnalysis();
    } catch(error) {
      console.error("Error while preparing analysis: ", error);
      setIsPreparing(false);
      setIsBlocked(true);
    }
  };

  useEffect(() => {
    if (!ongoingAnalysis)
      handleAnalysis();
    else
      setIsAnalysing(true);
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
          <AnalysisProg />
        </div>
      )}

      {!isAnalysing && !isPreparing && !isBlocked && (
        <div className="text-center mt-5 text-muted">No analysis currently in progress.</div>
      )}

    </div>
  );
}