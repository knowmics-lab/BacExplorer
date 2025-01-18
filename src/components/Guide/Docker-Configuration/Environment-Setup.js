import React, { useState, useEffect } from "react";
import { Button, ProgressBar } from "react-bootstrap";

export default function EnvSetup() {
    const [isCreating, setIsCreating] = useState(false);
    const [status, setStatus] = useState({ created: false, error: false });
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);  // Percentuale di progresso
    const [currentStage, setCurrentStage] = useState(""); // Descrizione dello stato corrente

    useEffect(() => {
        // Ascolta gli eventi di progresso
        window.api.on('progress', (data) => {
            setProgress(data.progress); // `progress` dovrebbe essere un numero
            setCurrentStage(data.status); // `status` dovrebbe essere una stringa
        });
    
        // Pulizia dell'event listener
        return () => {
            window.api.removeAllListeners('progress');
        };
    }, []);
    

    const handleClick = async () => {
        if (isCreating) return;

        if (status.error) {
            // Se c'è un errore, ricarica la pagina
            setProgress(0);
            setCurrentStage("");
            window.location.reload();
            return;
        }

        setIsCreating(true);
        setStatus({ created: false, error: false });
        setProgress(0);

        try {
            const response = await window.api.createEnv(); // Invoca la creazione del container
            console.log(response);
            setStatus({ created: true, error: false });
        } catch (error) {
            console.error("Error: ", error);
            setStatus({ created: false, error: true });
            setError(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="text-container">
            <h2 className="text-header">2. Environment Setup</h2>
            <div className="text-simple">
                Once you have Docker installed, <b>run it</b>.<br />
                Then click <a className="text-emphasis" onClick={handleClick}>here</a> to setup the environment.
            </div>
            {isCreating && (
                <>
                    <ProgressBar animated now={progress} label={`${progress}%`} />
                    <div>{currentStage}</div>
                </>
            )}
            {!isCreating && status.created && (
                <div className="text-simple primary">
                    <b>Environment successfully created!</b><br />
                    You are now ready to launch your analysis.
                </div>
            )}
            {!isCreating && status.error && (
                <div className="text-simple" style={{ color: "red" }}>Something went wrong! {error}</div>
            )}
        </div>
    );
}



// import React, { useState } from "react";
// import { Button, Spinner } from "react-bootstrap";

// export default function EnvSetup() {
//     const [isCreating, setIsCreating] = useState(false);
//     const [status, setStatus] = useState({ created: false, error: false });
//     const [error, setError] = useState("");

//     const handleClick = async () => {
//         if (isCreating) return;
//         setIsCreating(true);
//         setStatus({ created: false, error: false });

//         try {
//             const response = await window.api.createEnv();
//             console.log(response);
//             setStatus({ created: true, error: false });
//         } catch (error) {
//             console.error("Error: ", error);
//             setStatus({ created: false, error: true });
//             setError(error.message);
//         } finally {
//             setIsCreating(false);
//         }
//     }

//     return(
//         <div className="text-container">
//             <h2 className="text-header">2. Environment Setup </h2>
//             <div className="text-simple">
//                 Once you have Docker installed, <b>run it</b>.<br/>
//                 Then click <a className="text-emphasis" onClick={handleClick}>here</a> to setup the environment
//                 to perform the analysis.
//             </div>
//             {isCreating && (
//                 <>
//                 <Button variant="secondary">
//                 <Spinner
//                   as="span"
//                   animation="grow"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                 />
//                 Creating environment...
//               </Button>
//               <div>This might take a while</div>
//               </>
//             )}
//             {!isCreating && status.created && (
//                 <div className="text-simple primary">
//                 <b>Environment successfully created!</b><br/>
//                 You are now ready to launch your analysis.
//                 Go to the Settings page.
//                 </div>
//             )}
//             {!isCreating && status.error && (
//                 <div className="text-simple" style={{color:"red"}}>Something went wrong! {error}</div>
//             )}
//         </div>
//     )
// }