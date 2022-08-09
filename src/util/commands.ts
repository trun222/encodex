import shell from 'shelljs';

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
  TODO: 
  Logging - ✅
  Doppler
  Rate Limiting
  Determine Membership
  Authentication
  Authorization 
  Error Handling 
  Valdiation
*/

export const Resize = ({ dimensions, inputFileName, outputFileName, url }: { dimensions: string, inputFileName?: string, outputFileName: string, url?: string }) => {
  if (url) {
    return shell.exec(`convert ${url} -resize ${dimensions} ${OUTPUT_PATH}/${outputFileName}`);
  } else {
    return shell.exec(`convert ${MEDIA_PATH}/${inputFileName} -resize ${dimensions} ${OUTPUT_PATH}/${outputFileName}`);
  }
};

export const Thumbnail = ({ dimensions, inputFileName, outputFileName, url }: { dimensions: string, inputFileName?: string, outputFileName: string, url?: string }) => {
  if (url) {
    return shell.exec(`convert ${url} -thumbnail ${dimensions} ${OUTPUT_PATH}/${outputFileName}`);
  } else {
    return shell.exec(`convert ${MEDIA_PATH}/${inputFileName} -thumbnail ${dimensions} ${OUTPUT_PATH}/${outputFileName}`);
  }
};

export const Reduce = ({ percentage, inputFileName, outputFileName, url }: { percentage: number, inputFileName: string, outputFileName: string, url?: string }) => {
  if (url) {
    return shell.exec(`convert ${url} -resize ${percentage} ${OUTPUT_PATH}/${outputFileName}`);
  } else {
    return shell.exec(`convert ${MEDIA_PATH}/${inputFileName} -resize ${percentage} ${OUTPUT_PATH}/${outputFileName}`);
  }
};

export const Quality = ({ quality, inputFileName, outputFileName, url }: { quality: number, inputFileName?: string, outputFileName: string, url?: string }) => {
  if (url) {
    return shell.exec(`convert ${url} -quality ${quality} ${OUTPUT_PATH}/${outputFileName}`);
  } else {
    return shell.exec(`convert ${MEDIA_PATH}/${inputFileName} -quality ${quality} ${OUTPUT_PATH}/${outputFileName}`);
  }
};

export const Format = ({ inputFileName, outputFileName, url }: { inputFileName?: string, outputFileName: string, url?: string }) => {
  if (url) {
    return shell.exec(`convert ${url} ${OUTPUT_PATH}/${outputFileName}`);
  } else {
    return shell.exec(`convert ${MEDIA_PATH}/${inputFileName} ${OUTPUT_PATH}/${outputFileName}`);
  }
};



// export const Quality2 = async ({ quality, inputFileName, outputFileName }: { quality: number, inputFileName: string, outputFileName: string }) => {
//   return new Promise((resolve, reject) => {
//     shell.exec(`convert ${inputFileName} -quality ${quality} -`, function (code, stdout, stderr) {
//       resolve(Buffer.from(binaryStringToBuffer(stdout)));
//     })
//   });
// };