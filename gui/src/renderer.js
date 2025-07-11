/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.jsx';

// renderer.js
// if(window.api) {
//     Object.assign(window.api, {
//     openErrorDialog: () => window.api?.openErrorDialog(),
//     selectFolder: () => window.api?.selectFolder(),
//     onNavigate: (page) => console.log('Navigating to: ', page),
//     // saveConfigFile: () => window.api?.saveConfigFile(),
//     onSnakemakeOutput: (data) => console.log('Output:', data)
// });
// }

// // Usa direttamente window.api per accedere alle funzioni esposte
// window.api.openErrorDialog?.();
// window.api.selectFolder?.();

// let currentPage = 'guide';

// window.api.onNavigate((event, page) => {
//     if (currentPage !== page) {
//       currentPage = page;
//       console.log(`Navigo verso la pagina: ${page}`);
//       // Qui puoi aggiornare il DOM o eseguire la navigazione
//       document.getElementById('content').innerText = `Pagina corrente: ${page}`;
//     } else {
//       console.log(`Sei già sulla pagina ${page}`);
//     }
//   });

// // Aggiungi un listener per Snakemake output
// window.api.onSnakemakeOutput((data) => {
//     console.log('Output received:', data);
// });


  
//   // Mostra una pagina iniziale di default
//   document.getElementById('content').innerHTML = '<h1>Home</h1><p>Seleziona una pagina dal menu.</p>';
  
  
console.log('👋 This message is being logged by "renderer.js", included via webpack');
