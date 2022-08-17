import fsPromise from 'fs/promises';
import fs from 'fs';
import { MimeToExtension } from '@/src/util/mimeTypes';

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

export const fileNameWithExtension = (name: string, mimeType): string => {
  return `${name}${MimeToExtension[mimeType]}`;
}

export const inputPath = (fileName: string): string => {
  return `${MEDIA_PATH}/${fileName}`;
}

export const outputPath = (fileName: string): string => {
  return `${OUTPUT_PATH}/${fileName}`;
}