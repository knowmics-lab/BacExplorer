import React, { useState, useEffect }       from 'react';
import { Button, Form, FormGroup, Spinner } from 'react-bootstrap';
import GenusSpe                             from './Genus-Species';
import Type                                 from './Type';
import FolderSel                            from './Select-Folder';
import ReportParams                         from './Report-Params';
import AnalysisName                         from './Analysis-Name';
import ParametersAlert                      from './Parameters-Alert';
import AnalysisProg                         from '../Snakemake-Feedback/Analysis-Progress';
import InvalidFolderAlert from './Invalid-Folder-Alert';

export default function Inputs () {
  const [formData, setFormData] = useState({
    NAME: '',
    GENUS: '',
    SPECIES: '',
    TYPE: '',
    PAIRED: '',
    INPUT: 'No Folder Selected',
    IDENTITY: 90,
    COVERAGE: 90,
  });

  const [validated, setValidated] = useState(false);
  const [isConfig, setIsConfig] = useState(false);
  const [configFile, setConfigFile] = useState();
  const [isInvalidFolder, setIsInvalidFolder] = useState(false);
  const [validateFolderMessage, setValidateFolderMessage] = useState("");
  const [prepOutput, setPrepOutput] = useState({error: false, message: ""});
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
        await saveConfig();
      }
    }
    setValidated(true);
  };

  const saveConfig = async () => {
    const date = new Date();
    const defaultName = "test_default_" +
      String(date.getDate()).padStart(2, "0") + "_" +
      String(date.getMonth() + 1).padStart(2, "0") + "_" + date.getFullYear();

    if (formData.NAME === "") {
      setFormData({
        ...formData,
        NAME: defaultName,
      });
    }
    
    const yamlData = {
      ...formData,
      NAME: formData.NAME === '' ? defaultName : formData.NAME, 
      PAIRED: formData.PAIRED === 'yes' ? 'yes' : 'no',
      IDENTITY: parseInt(formData.IDENTITY),
      COVERAGE: parseInt(formData.COVERAGE),
    };

    const validatedFolder = await window.api.validateInputFolder(yamlData.INPUT, yamlData.TYPE);
    console.log("validated folder response: ", validatedFolder);
    console.log(validatedFolder.success);
    if (!validatedFolder.success) {
      // throw alert
      setIsInvalidFolder(true);
      setValidateFolderMessage(validatedFolder.message);
    } else {
      const yamlString = JSON.stringify(yamlData, null, 2);
      const response = await window.api.saveConfigFile(yamlString);
      if (response.success) {
        console.log('Config file saved at:', response.filePath);
        setIsConfig(true);
        setConfigFile(response.filePath);
        setShowAlert(true);
      } else {
        console.error('Failed to save config file:', response.error || 'Unknown error');
      }
    }
  };

  const handleAnalysis = async () => {
    setShowAlert(false);
    setIsPreparing(true);
    try {
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
      {showAlert && (
        <div className="position-fixed top-50 start-50 translate-middle z-3 w-50">
          <ParametersAlert formData={formData} setShowAlert={setShowAlert} onButtonClick={handleAnalysis}/>
        </div>
      )}

      {isInvalidFolder && (
        <div className="position-fixed top-50 start-50 translate-middle z-3 w-50">
          <InvalidFolderAlert setShowAlert={setIsInvalidFolder} message={validateFolderMessage}/>
        </div>
      )}

      {isPreparing && !isBlocked && (

        <div className="position-fixed top-50 start-50 translate-middle">
          <Button disabled variant="secondary">
            <Spinner as="span"
                     animation="grow"
                     size="sm"
                     role="status"
                     aria-hidden="true"/>Preparing for Snakemake...</Button>
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

      {!isAnalysing && !isPreparing && (
        <Form noValidate validated={validated} onSubmit={handleSubmit}>

          <FormGroup className="form-box white py-3">
            {/* <h1 className="text-header">Name your analysis</h1>
                        <Form.Control type ='text' id="name" placeholder='My Analysis' value={formData.NAME || ""} ></Form.Control> */}
            <AnalysisName formData={formData} setFormData={setFormData}/>
          </FormGroup>

          <FormGroup className="form-box py-4">
            <GenusSpe formData={formData} setFormData={setFormData}/>
          </FormGroup>

          <FormGroup className="form-box white py-3">
            <Type formData={formData} setFormData={setFormData}/>
          </FormGroup>

          <FormGroup className="form-box py-3">
            <ReportParams formData={formData} setFormData={setFormData}/>
          </FormGroup>

          <FormGroup className="form-box white py-3">
            <FolderSel formData={formData} setFormData={setFormData}/>
          </FormGroup>

          <div className="form-box py-3">
            <Button type="submit" variant="primary">Done!</Button>
          </div>
        </Form>
      )}
    </div>
  );
}