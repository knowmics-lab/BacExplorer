const fs = require('fs');
const path = require('path');
const { app } = require('electron');

module.exports = {
  postPackage: async (forgeConfig, options) => {
    console.warn("Moving snakemake into resources");
    const sourcePath = path.join(__dirname, './snakemake');
    console.warn("Options: ", options);
    const packagedApp = options.outputPaths[0];
    console.log(packagedApp);
    const destDir = path.join(packagedApp, "resources", "snakemake");
    copySnakemake(sourcePath, destDir);
  }
}

function copySnakemake(source, target) {

  if (fs.existsSync(source)) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    fs.readdirSync(source).forEach((file) => {
      const sourceFile = path.join(source, file);
      const destFile = path.join(target, file);

      if (fs.statSync(sourceFile).isDirectory()) {
        copySnakemake(sourceFile, destFile);
      } else {
        fs.copyFileSync(sourceFile, destFile);
      }

    });
    console.error("Files successfully copied");
  } else {
    console.error('Snakemake folder does not exist.');
  }
}

