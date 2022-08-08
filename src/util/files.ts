import fsPromise from 'fs/promises';
import fs from 'fs';

export const loadFile = async (fileName: string, directory: string): Promise<Buffer> => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
    return await fsPromise.readFile(`./${directory}/${fileName}`);
  } else {
    return await fsPromise.readFile(`./${directory}/${fileName}`);
  }
}

export const writeFile = async (fileName: string, directory: string, buffer: Buffer): Promise<void> => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
    return await fsPromise.writeFile(`./${directory}/${fileName}`, buffer);
  } else {
    return await fsPromise.writeFile(`./${directory}/${fileName}`, buffer);
  }
}