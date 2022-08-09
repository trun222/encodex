import shell from 'shelljs';

export const MEDIA_PATH = './media'
export const OUTPUT_PATH = './output'

export const Resize = ({ dimensions, inputFileName, outputFileName }: { dimensions: string, inputFileName: string, outputFileName: string }) => {
  return shell.exec(`convert ${MEDIA_PATH}/${inputFileName} -resize ${dimensions} ${OUTPUT_PATH}/${outputFileName}`)
};

export const Reduce = ({ percentage, inputFileName, outputFileName }: { percentage: number, inputFileName: string, outputFileName: string }) => {
  return shell.exec(`magick ${MEDIA_PATH}/${inputFileName} -resize ${percentage} ${OUTPUT_PATH}/${outputFileName}`)
};

export const Quality = ({ quality, inputFileName, outputFileName }: { quality: number, inputFileName: string, outputFileName: string }) => {
  return shell.exec(`convert ${MEDIA_PATH}/${inputFileName} -quality ${quality} ${OUTPUT_PATH}/${outputFileName}`)
};

export const Quality2 = ({ quality, inputFileName, outputFileName }: { quality: number, inputFileName: string, outputFileName: string }) => {
  return shell.exec(`convert ${inputFileName} -quality ${quality} ${OUTPUT_PATH}/${outputFileName}`)
};