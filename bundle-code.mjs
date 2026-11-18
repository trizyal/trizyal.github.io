import fs from 'node:fs';
import path from 'node:path';

const srcDir = './src';
const outputFile = './all_code.txt';

// Recursively get all files in the directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

try {
  const files = getAllFiles(srcDir);
  let combinedOutput = '';

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    // Normalize path separators for Windows/Unix
    const cleanPath = file.replace(/\\/g, '/');
    combinedOutput += `\n\n========== FILE: ${cleanPath} ==========\n\n`;
    combinedOutput += content;
  });

  fs.writeFileSync(outputFile, combinedOutput.trim());
  console.log(`✅ Successfully merged ${files.length} files into ${outputFile}`);
} catch (err) {
  console.error('❌ Error reading directories or files:', err.message);
}