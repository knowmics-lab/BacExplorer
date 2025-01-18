import React, { useState, useEffect } from "react";
import { Button, Form, FormGroup, Spinner } from "react-bootstrap";
import GenusSpe from "./Genus-Species";
import Type from "./Type";
import FolderSel from "./Select-Folder";
import ReportParams from "./Report-Params";
import AnalysisName from "./Analysis-Name";
import ParametersAlert from "./Parameters-Alert";
import AnalysisProg from "../Snakemake-Feedback/Analysis-Progress";

export default function Inputs(){
    const [formData, setFormData] = useState({
        NAME: "",
        GENUS: "",
        SPECIES: "",
        TYPE: "",
        PAIRED: "",
        INPUT: "No Folder Selected",
        IDENTITY: 90,
        COVERAGE: 90,
    });

    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (formData.INPUT == "No Folder Selected") {
            alert(`ERROR: Please select a folder`);
            event.stopPropagation();
        } else {
            if (form.checkValidity() === false) {
                event.stopPropagation();
            }
            saveConfig();
        }
        setValidated(true);
    };

    const [isConfig, setIsConfig] = useState(false);

    const [configFile, setConfigFile] = useState();

    const [output, setOutput] = useState();

    const [showAlert, setShowAlert] = useState(false);

    const [progress, setProgress] = useState(0);

    const [isAnalysing, setIsAnalysing] = useState(false);

    const [isPreparing, setIsPreparing] = useState(false);

    const [isBlocked, setIsBlocked] = useState(false);

    const saveConfig = async () => {
        const yamlData = {
            ...formData,
            PAIRED: formData.PAIRED === 'yes' ? 'yes' : 'no',
            IDENTITY: parseInt(formData.IDENTITY),
            COVERAGE: parseInt(formData.COVERAGE)
        };
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
      };

    const handleAnalysis = () => {
        setShowAlert(false);
        window.api.prepareSnakemake(formData.INPUT);
        setIsPreparing(true);
        // setIsAnalysing(true);
      }

      useEffect(() => {
        window.api.onSnakemakeOutput((data) => {
            console.log('Received data from Snakemake: ', data);

            if (data) {
                console.log('Data properties:', data);
            }

            if (data.stderr) {
                if (data.isError) {
                    setOutput(`Error: ${data.stderr}`);
                    setIsBlocked(true);
                    // if (data.errorCode === 404) {
                    //     console.error('File not found error detected:', data.message);
                    //     setOutput(`Error: ${data.message}`);
                    //     setIsError(true);
                    // }
                    return;
                }
            }

            if (data.stderr) {
                setOutput(`Error: ${data.stderr}`);
                if (data.stderr.match(/Error/)) {
                    setOutput(`Error: ${data.stderr}`);
                }
                if (data.stderr.match(/Finished job/)) {
                    setOutput(`Output: ${data.stderr}`);
                }
                const progressMatch = data.stderr.match(/(\d+)%/);
                if (progressMatch && progressMatch[1]) {
                const percentage = parseInt(progressMatch[1], 10);
                setProgress(percentage);
                }
            } else {
                setOutput(`Output: ${data.stdout}`);
            }
        });
    }, []);

    return(
        <div className='custom-container d-flex flex-column min-vh-100'>
            {showAlert && (
                <div className="position-fixed top-50 start-50 translate-middle z-3 w-50">
                    <ParametersAlert formData={formData} setShowAlert={setShowAlert} onButtonClick={handleAnalysis}/>
                </div>
            )}

            {isPreparing && !isBlocked && (

                <div className='position-fixed top-50 start-50 translate-middle'>
                    <Button disabled variant="secondary">
                    <Spinner as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"/>Preparing for Snakemake...</Button>
                </div>
            )}
            {isPreparing && isBlocked && (
                    <Button className = "position-fixed top-50 start-50 translate-middle w-25"disabled variant="danger">
                        {output}</Button>
            )}

            {isAnalysing && (
                <div className="position-fixed top-50 start-50 translate-middle z-3 w-75">
                    <AnalysisProg progress={progress} output={output}/>
                </div>
            )}

            {!isAnalysing && !isPreparing && (
                <Form noValidate validated={validated} onSubmit={handleSubmit}>

                    <FormGroup className="form-box white py-3">
                        {/* <h1 className="text-header">Name your analysis</h1>
                        <Form.Control type ='text' id="name" placeholder='My Analysis' value={formData.NAME || ""} ></Form.Control> */}
                        <AnalysisName formData={formData} setFormData={setFormData}/>
                    </FormGroup>

                    <FormGroup className='form-box py-4'>
                        <GenusSpe formData={formData} setFormData={setFormData}/> 
                    </FormGroup>
                    
                    <FormGroup className='form-box white py-3'>
                        <Type formData={formData} setFormData={setFormData}/>
                    </FormGroup>
                    
                    <FormGroup className='form-box py-3'>
                        <ReportParams formData={formData} setFormData={setFormData}/>
                    </FormGroup>

                    <FormGroup className="form-box white py-3">
                        <FolderSel formData={formData} setFormData={setFormData}/>
                    </FormGroup>

                    <div className='form-box py-3'>
                        <Button type='submit' variant="primary">Done!</Button>
                    </div>
                </Form>
            )}
        </div>
    )
}