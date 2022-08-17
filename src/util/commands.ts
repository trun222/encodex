import shell from 'shelljs';
import { fileNameWithExtension, inputPath, outputPath } from '@/src//util/files';

export const MEDIA_PATH = './media'
export const OUTPUT_PATH = './output'

/* API Base functionality
  Upload - Return Asset Id - Write Wasabi Lib
  Resize,    - DONE ✅
  Reduce,   - DONE ✅
  Quality,   - DONE ✅
  Thumbnail, - DONE ✅
  Web - (Thumbnail, Cover, Full) - Hold Off
  Format - (JPG, PNG, GIF) - DONE ✅
*/

/*
  Logging - ✅
  Doppler - ✅
  API Token - ✅
  Planet Scale - ✅
  Rate Limiting - ✅
  Determine Membership - ✅
  Validation - ✅
  Error Handling - ✅
  File Size Checks - ✅
*/

export const Resize = ({ dimensions, inputFileName, outputFileName, mimeType }: { dimensions: string, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return shell.exec(`convert ${inputPath(inputFileName)} -resize ${dimensions} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`);
};

export const Thumbnail = ({ dimensions, inputFileName, outputFileName, mimeType }: { dimensions: string, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return shell.exec(`convert ${inputPath(inputFileName)} -thumbnail ${dimensions} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`);
};

export const Reduce = ({ percentage, inputFileName, outputFileName, mimeType }: { percentage: number, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return shell.exec(`convert ${inputPath(inputFileName)} -resize ${percentage} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`);
};

export const Quality = ({ quality, inputFileName, outputFileName, mimeType }: { quality: number, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return shell.exec(`convert ${inputPath(inputFileName)} -quality ${quality}% ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`);
};

export const Format = ({ inputFileName, outputFileName, mimeType }: { inputFileName: string, outputFileName: string, mimeType: string }) => {
  return shell.exec(`convert ${inputPath(inputFileName)} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`);
};

// export const Quality2 = async ({ quality, inputFileName, outputFileName }: { quality: number, inputFileName: string, outputFileName: string }) => {
//   return new Promise((resolve, reject) => {
//     shell.exec(`convert ${inputFileName} -quality ${quality} -`, function (code, stdout, stderr) {
//       resolve(Buffer.from(binaryStringToBuffer(stdout)));
//     })
//   });
// };