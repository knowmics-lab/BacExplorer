import React, { useState }       from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';
import GenusSpe                             from './Genus-Species';
import Type                                 from './Type';
import FolderSel                            from './Select-Folder';
import ReportParams                         from './Report-Params';
import AnalysisName from './Analysis-Name';
import TecnhicalSettings from './Technical-Settings';
import ParametersAlert                      from './Parameters-Alert';
import InvalidFolderAlert from './Invalid-Folder-Alert';
import { saveConfig } from './Settings_Functions';
import OngoingAnalysis from '../Ongoing-Analysis';

export default function Inputs({ formData, setFormData, ongoingAnalysis }) {
  const [validated, setValidated] = useState(false);
  const [isConfig, setIsConfig] = useState(false);
  const [configFile, setConfigFile] = useState();
  const [isInvalidFolder, setIsInvalidFolder] = useState(false);
  const [validateFolderMessage, setValidateFolderMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  
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
        await saveConfig(formData, setFormData, setIsInvalidFolder, setValidateFolderMessage, setShowAlert, setIsConfig, setConfigFile);
      }
    }
    setValidated(true);
  };

  const launchAnalysis = async () => {
    window.api.navigate('analysis');
  };

  return (
    <div className="custom-container d-flex flex-column min-vh-100">
      {ongoingAnalysis &&
        <div className="position-sticky top-0 start-50 w-100" style={{ zIndex: 1050 }}>
            <OngoingAnalysis />
        </div>
      }
      {showAlert && (
        <div className="position-fixed top-50 start-50 translate-middle z-3 w-50">
          <ParametersAlert formData={formData} setShowAlert={setShowAlert} onButtonClick={launchAnalysis}/>
        </div>
      )}

      {isInvalidFolder && (
        <div className="position-fixed top-50 start-50 translate-middle z-3 w-50">
          <InvalidFolderAlert setShowAlert={setIsInvalidFolder} message={validateFolderMessage}/>
        </div>
      )}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>

        <FormGroup className="form-box white py-3">
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

        <FormGroup className="form-box py-3">
          <TecnhicalSettings formData={formData} setFormData={setFormData}/>
        </FormGroup>

        <FormGroup className="form-box white py-3">
          <FolderSel formData={formData} setFormData={setFormData}/>
        </FormGroup>

        <div className="form-box py-3">
          <Button type="submit" variant="primary">Done!</Button>
        </div>
      </Form>
    </div>
  );
}