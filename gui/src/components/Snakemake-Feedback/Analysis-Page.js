import { useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import AnalysisProg from '../Snakemake-Feedback/Analysis-Progress';

export default function AnalysisPage() {
    const [isAnalysing, setIsAnalysing] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [prepOutput, setPrepOutput] = useState({ error: false, message: "" });


    async function handleAnalysis() {
        setIsPreparing(true);
        try {
            await window.api.prepareSnakemake(formData.INPUT);
            setIsPreparing(false);
            setIsAnalysing(true);
            window.api.launchAnalysis();
        } catch (error) {
            console.error("Error while preparing analysis: ", error);
            setIsPreparing(false);
            setIsBlocked(true);
        }
    }

    useEffect(() => {
        handleAnalysis();
        window.api.onSnakemakeOutput((data) => {
            console.log('Received data from Snakemake: ', data);

            if (data.isError) {
                setPrepOutput({ error: true, message: `Stderr: ${data.stderr}` });
                setIsBlocked(true);
            }
        });
    }, []);

    return (
        <div className="custom-container d-flex flex-column min-vh-100">

            {isPreparing && !isBlocked && (

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
                    <AnalysisProg progress={progress} setProgress={setProgress} />
                </div>
            )}
        </div>
    );
}