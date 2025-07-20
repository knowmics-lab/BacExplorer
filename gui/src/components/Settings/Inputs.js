import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Spinner } from 'react-bootstrap';
import GenusSpe from './Genus-Species';
import Type from './Type';
import FolderSel from './Select-Folder';
import ReportParams from './Report-Params';
import AnalysisName from './Analysis-Name';
import TecnhicalSettings from './Technical-Settings';
import ParametersAlert from './Parameters-Alert';
import AnalysisProg from '../Snakemake-Feedback/Analysis-Progress';
import InvalidFolderAlert from './Invalid-Folder-Alert';
import { saveConfig } from './Settings_functions';

export default function Inputs() {
  const [formData, setFormData] = useState({
    NAME: '',
    GENUS: null,
    SPECIES: '',
    TYPE: '',
    PAIRED: '',
    INPUT: 'No Folder Selected',
    IDENTITY: 90,
    COVERAGE: 90,
    THREADS_NUMBER: 2,
    GENOMAD_ANALYSIS: 'yes',
  });

  const [validated, setValidated] = useState(false);
  const [isConfig, setIsConfig] = useState(false);
  const [configFile, setConfigFile] = useState();
  const [isInvalidFolder, setIsInvalidFolder] = useState(false);
  const [validateFolderMessage, setValidateFolderMessage] = useState("");
  const [prepOutput, setPrepOutput] = useState({ error: false, message: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (formData.INPUT == 'No Folder Selected') {
      alert(`ERROR: Please select a folder`);
      event.stopPropagation();
    } else {
      if (form.checkValidity() === false) {
        event.stopPropagation();
      } else {
        await saveConfig(formData, setFormData, setIsInvalidFolder, setValidateFolderMessage);
      }
    }
    setValidated(true);
  };

  const goToAnalysis = async () => {
    setShowAlert(false);
    window.api.send('navigate', 'analysis');

    // redirect to ANALYSIS PAGE


    // setIsPreparing(true);
    // try {
    //   await window.api.prepareSnakemake(formData.INPUT);
    //   setIsPreparing(false);
    //   setIsAnalysing(true);
    //   window.api.launchAnalysis();
    // } catch (error) {
    //   console.error("Error while preparing analysis: ", error);
    //   setIsPreparing(false);
    //   setIsBlocked(true);
    // }
  };



  return (
    <div className="custom-container d-flex flex-column min-vh-100">
      {showAlert && (
        <div className="position-fixed top-50 start-50 translate-middle z-3 w-50">
          <ParametersAlert formData={formData} setShowAlert={setShowAlert} onButtonClick={goToAnalysis} />
        </div>
      )}

      {isInvalidFolder && (
        <div className="position-fixed top-50 start-50 translate-middle z-3 w-50">
          <InvalidFolderAlert setShowAlert={setIsInvalidFolder} message={validateFolderMessage} />
        </div>
      )}

      {/* {isPreparing && !isBlocked && (

        <div className="position-fixed top-50 start-50 translate-middle">
          <Button disabled>
            <Spinner as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true" /> Preparing for Snakemake...</Button>
        </div>
      )}
      {isPreparing && isBlocked && (
        <Button className="position-fixed top-50 start-50 translate-middle w-25" disabled variant="danger">
          {prepOutput.message}</Button>
      )}

      {isAnalysing && (
        <div className="position-fixed top-50 start-50 translate-middle z-3 w-75">
          {/* <AnalysisProg progress={progress} setProgress={setProgress} message={output.message} error={output.error}/> */}
      {/* <AnalysisProg progress={progress} setProgress={setProgress} />
    </div>
  )
} */}

      {!isAnalysing && !isPreparing && (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>

          <FormGroup className="form-box white py-3">
            {/* <h1 className="text-header">Name your analysis</h1>
                        <Form.Control type ='text' id="name" placeholder='My Analysis' value={formData.NAME || ""} ></Form.Control> */}
            <AnalysisName formData={formData} setFormData={setFormData} />
          </FormGroup>

          <FormGroup className="form-box py-4">
            <GenusSpe formData={formData} setFormData={setFormData} />
          </FormGroup>

          <FormGroup className="form-box white py-3">
            <Type formData={formData} setFormData={setFormData} />
          </FormGroup>

          <FormGroup className="form-box py-3">
            <ReportParams formData={formData} setFormData={setFormData} />
          </FormGroup>

          <FormGroup className="form-box py-3">
            <TecnhicalSettings formData={formData} setFormData={setFormData} />
          </FormGroup>

          <FormGroup className="form-box white py-3">
            <FolderSel formData={formData} setFormData={setFormData} />
          </FormGroup>

          <div className="form-box py-3">
            <Button type="submit" variant="primary">Done!</Button>
          </div>
        </Form>
      )
      }
    </div >
  );
}