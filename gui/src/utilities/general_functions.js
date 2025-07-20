import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { BrowserWindow } from 'electron';
import { flags, userVariables } from './global_variables';

// handle feedback to send to frontend
export function emitProgress(status, progress) {
  const window = BrowserWindow.getAllWindows()[0];
  if (window) {
    window.webContents.send('progress', { status, progress });
  } else {
    console.error('No active window to send progress');
  }
}

function liveDemuxStream(stream, onStdout, onStderr, onEnd, checkRunning, timeoutRunning) {
  timeoutRunning = timeoutRunning || 30000;
  let nextDataType = null;
  let nextDataLength = -1;
  let buffer = Buffer.from('');
  let ended = false;

  const bufferSlice = (end) => {
    const out = buffer.subarray(0, end);
    buffer = Buffer.from(buffer.subarray(end, buffer.length));
    return out;
  };
  const processData = (data) => {
    if (data) {
      buffer = Buffer.concat([buffer, data]);
    }
    if (nextDataType) {
      if (buffer.length >= nextDataLength) {
        const content = bufferSlice(nextDataLength);
        if (onStdout && nextDataType === 1) {
          onStdout(Buffer.from(content));
        } else if (onStderr && nextDataType !== 1) {
          onStderr(Buffer.from(content));
        }
        nextDataType = null;
        processData();
      }
    } else if (buffer.length >= 8) {
      const header = bufferSlice(8);
      nextDataType = header.readUInt8(0);
      nextDataLength = header.readUInt32BE(4);
      processData();
    }
  };

  stream.on('data', processData).on('end', () => {
    if (!ended && onEnd) {
      onEnd();
      ended = true;
    }
  });
  if (checkRunning) {
    const fnRunning = async () => {
      if (ended) return;
      if (await checkRunning()) {
        setTimeout(fnRunning, timeoutRunning);
      } else if (!ended && onEnd) {
        onEnd();
        ended = true;
      }
    };
    setTimeout(fnRunning, timeoutRunning);
  }
}

export async function demuxStream(stream, onStdout, onStderr, onEnd, checkRunning, timeoutRunning) {
  timeoutRunning = timeoutRunning || 30000;
  return new Promise((resolve) => {
    liveDemuxStream(
      stream,
      (content) => {
        onStdout && onStdout(content.toString());
      },
      (content) => {
        onStderr && onStderr(content.toString());
      },
      () => {
        onEnd && onEnd();
        resolve();
      },
      checkRunning,
      timeoutRunning,
    );
  });
}

// handle downloads
function processCurlOutput(data, statusMessage) {
  const match = data.toString().match(/(\d+)%/);
  if (match) {
    emitProgress(statusMessage, parseInt(match[1]));
  } else {
    // we are on linux/mac, get the last line of the output
    const lines = data.toString().split('\r');
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      const match = lastLine.trim().match(/\s*(\d+)\s+/);
      if (match) {
        emitProgress(statusMessage, parseInt(match[1]));
      }
    }
  }
}

export async function downloadFile(source, destination, statusMessage) {
  return new Promise((resolve, reject) => {
    const downloadProcess = spawn('curl', ['-L', source, '-o', destination]);
    downloadProcess.stdout.setEncoding('utf8');
    downloadProcess.stderr.setEncoding('utf8');
    downloadProcess.stdout.on('data', (data) => {
      processCurlOutput(data, statusMessage);
    });
    downloadProcess.stderr.on('data', (data) => {
      processCurlOutput(data, statusMessage);
    });
    downloadProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Download failed with code ${code}`));
      }
    });
  });
}

// create directory if not found
export function checkDir(directory) {
    try {
        if (!fs.existsSync(directory)) {
            console.log("Creating ", directory);
            fs.mkdirSync(directory, { recursive: true });
        }
        else 
            console.log("Directory: ", directory, " exitst");
    } catch (error) {
        throw(error);
    }
  
}

// return host machine architecture
export function checkArchitecture() {
  console.log("Detected architecture: ", process.arch);
  return ["arm64", "arm"].includes(process.arch);
}

export async function makeGenusDictionary(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const dict = {};
    
        const lines = data.split('\n');
    
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
    
          const parts = line.split(/\,+/);
          if (parts.length >= 2) {
            const [rawGenus, rawSpecies] = parts[1].split('_');
            const genus = rawGenus.replace(/"/g, '');
            if (rawSpecies) {
              const species = rawSpecies.replace(/"/g, '');
              if (genus && species) {
                if (!dict[genus]) {
                  dict[genus] = new Set();
                }
                dict[genus].add(species);
    
                if (!dict[genus].has(null)) {
                  dict[genus].add(null);
                }
              }
            } else {
              if (!dict[genus]) {
                dict[genus] = new Set();
              }
              dict[genus].add("");
            }
          }
        }
    
        const genusSpeciesMap = {};
        for (const genus in dict) {
          genusSpeciesMap[genus] = Array.from(dict[genus]);
        }
        return genusSpeciesMap;
      } catch (err) {
        console.error('Error reading file:', err);
        throw err;
      }
}

export function saveUserInput(configFile, outputExists) {
  const originalConfig = yaml.load(fs.readFileSync(configFile, 'utf8'));
  userVariables.originalConfigInput = originalConfig.INPUT;
  userVariables.userAnalysisName = originalConfig.NAME;
  console.log("Analysis name: ",  userVariables.userAnalysisName);
  console.log("Input folder: ", userVariables.originalConfigInput);
  if (outputExists) {
    const outputFolder = path.join(userVariables.originalConfigInput, "output");
    removeOutputFolder(outputFolder);
  }
}

export function isDirEmpty(files) {
  console.log("Files in directory: ", files);
  if (files.length === 0) {
    console.error("Directory is empty!");
    return true;
  }
  return false;
}

export function validateFormat(files, invalidFiles, type) {
  if (type.toLowerCase() === "fasta") {
    invalidFiles = files.filter(file => path.extname(file).toLowerCase() !== `.${type}`);
  } else if (type.toLowerCase() === "fastq") {
    invalidFiles = files.filter(file =>
      !file.toLowerCase().endsWith(".fq.gz") &&
      !file.toLowerCase().endsWith(".fastq.gz")
    );
  }
  invalidFiles = invalidFiles.filter(file => !file.match(/(Zone.Identifier|DS_Store)/));
  console.log("Invalid files: ", invalidFiles);
  return invalidFiles;
}

export function outputFolderExists(files, outputFolder) {
  // returns false if output folder does not exist, true if it does.
  if (files.includes(outputFolder)) {
    console.log("Output folder already exists: will be overwritten.");
    flags.outputExists = true;
    return;
  }
  console.log("Output folder does not exist.");
  flags.outputExists = false;
}

function removeOutputFolder(outputFolder) {
  fs.rm(outputFolder, {recursive: true, force: true}, err => {
    console.log("Removing output folder...");
    if (err) {
      throw ("Error while removing output folder: ", err);
    }
    console.log("Output folder removed successfully");
  })
}