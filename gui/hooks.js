const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Percorso della cartella snakemake nella tua struttura di progetto

module.exports = {
  postPackage: async (forgeConfig, options) => {
    console.warn("Moving snakemake into resources");
    const sourcePath = path.join(__dirname, 'snakemake');
    console.warn("Options: ", options);
    const packagedApp = options.outputPaths[0];
    console.log(packagedApp);
    const destDir = path.join(packagedApp, "resources", "snakemake");
    copySnakemake(sourcePath, destDir);
  }
}

function copySnakemake(source, target) {
  
  //console.warn("SourcePath is: ", sourcePath);

  //console.warn("Options: ", app.getAppPath());
  
  //console.warn("DestDir is: ", destDir);
  if (fs.existsSync(source)) {
    // Crea la cartella di destinazione se non esiste
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
      // console.log("target created");
    }

    // Copia i file della cartella `snakemake`
    fs.readdirSync(source).forEach((file) => {
      const sourceFile = path.join(source, file);
      const destFile = path.join(target, file);

      // console.warn(`Copying ${sourceFile} into ${destFile}`);

      if (fs.statSync(sourceFile).isDirectory()) {
        copySnakemake(sourceFile, destFile);
      } else {
        fs.copyFileSync(sourceFile, destFile);
      }

    });
  
    // console.warn('Cartella snakemake copiata nella cartella resources.');
  } else {
    console.error('La cartella snakemake non esiste.');
  }
}

