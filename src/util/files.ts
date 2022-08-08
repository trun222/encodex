import fsPromise from 'fs/promises';
import fs from 'fs';

export const MEDIA_PATH = './media'
export const OUTPUT_PATH = './output'

export const createFolders = (): void => {
  if (!fs.existsSync(MEDIA_PATH)) {
    fs.mkdirSync(MEDIA_PATH);
  }
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH);
  }
}

export const loadFile = async (fileName: string, directory: string): Promise<Buffer> => {
  return fsPromise.readFile(`./${directory}/${fileName}`);
}

export const writeFile = async (fileName: string, directory: string, buffer: Buffer): Promise<void> => {
  return await fsPromise.writeFile(`./${directory}/${fileName}`, buffer);
}