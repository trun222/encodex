import shell from 'shelljs';
import { fileNameWithExtension, inputPath, outputPath } from '@/src//util/files';

export const MEDIA_PATH = './media'
export const OUTPUT_PATH = './output'

export const Resize = ({ dimensions, inputFileName, outputFileName, mimeType }: { dimensions: string, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    shell.exec(`convert ${inputPath(inputFileName)} -resize ${dimensions} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Moonlight = ({ inputFileName, outputFileName, moonValue, mimeType }: { inputFileName: string, outputFileName: string, moonValue: number, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    shell.exec(`convert ${inputPath(inputFileName)} -blue-shift ${moonValue} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Sharpen = ({ inputFileName, outputFileName, sharpenValue, mimeType }: { inputFileName: string, outputFileName: string, sharpenValue: number, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`convert ${inputPath(inputFileName)} -adaptive-sharpen 0x${sharpenValue} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Average = ({ inputFileName, outputFileName, mimeType }: { inputFileName: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`convert ${inputPath(inputFileName)} -auto-level ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  })
}

export const Gray = ({ inputFileName, outputFileName, mimeType }: { inputFileName: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`convert ${inputPath(inputFileName)} -colorspace gray ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Collage = ({ inputFileNameOne, inputFileNameTwo, outputFileName, mimeType }: { inputFileNameOne: string, inputFileNameTwo: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`montage -label %f -frame 5 -geometry +4+4 ${inputPath(inputFileNameOne)} ${inputPath(inputFileNameTwo)} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Thumbnail = ({ dimensions, inputFileName, outputFileName, mimeType }: { dimensions: string, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`convert ${inputPath(inputFileName)} -thumbnail ${dimensions} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Reduce = ({ percentage, inputFileName, outputFileName, mimeType }: { percentage: number, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`convert ${inputPath(inputFileName)} -resize ${percentage} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Quality = ({ quality, inputFileName, outputFileName, mimeType }: { quality: number, inputFileName: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`convert ${inputPath(inputFileName)} -quality ${quality}% ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

export const Format = ({ inputFileName, outputFileName, mimeType }: { inputFileName: string, outputFileName: string, mimeType: string }) => {
  return new Promise((resolve, reject) => {
    return shell.exec(`convert ${inputPath(inputFileName)} ${outputPath(fileNameWithExtension(outputFileName, mimeType))}`, function (code, stdout, stderr) {
      if (stderr) {
        reject('Failed to find file with id')
      }
      resolve(null);
    });
  });
};

// export const Quality2 = async ({ quality, inputFileName, outputFileName }: { quality: number, inputFileName: string, outputFileName: string }) => {
//   return new Promise((resolve, reject) => {
//     shell.exec(`convert ${inputFileName} -quality ${quality} -`, function (code, stdout, stderr) {
//       resolve(Buffer.from(binaryStringToBuffer(stdout)));
//     })
//   });
// };