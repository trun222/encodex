import fsPromise from 'fs/promises';
import fs from 'fs';
import { MimeToExtension } from '@/src/util/mimeTypes';

export const MEDIA_PATH = './media'
export const OUTPUT_PATH = './output'
export const CHUNK_SIZE = 5 * 1024 * 1024;

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

export const fileMetaData = async (fileName: string, directory: string): Promise<any> => {
  const stats = await fsPromise.stat(`./${directory}/${fileName}`);
  return {
    name: fileName,
    size: stats.size,
  }
}

export const loadFileStream = async (fileName: string, directory: string): Promise<fs.ReadStream> => {
  return fs.createReadStream(`./${directory}/${fileName}`, { highWaterMark: 1 * 1024, encoding: 'utf8' });
}

export const writeFile = async (fileName: string, directory: string, buffer: Buffer): Promise<void> => {
  return fsPromise.writeFile(`./${directory}/${fileName}`, buffer, 'utf-8');
}

export const fileNameWithExtension = (name: string, mimeType: string): string => {
  return `${name}${MimeToExtension[mimeType]}`;
}

export const inputPath = (fileName: string): string => {
  return `${MEDIA_PATH}/${fileName}`;
}

export const outputPath = (fileName: string): string => {
  return `${OUTPUT_PATH}/${fileName}`;
}