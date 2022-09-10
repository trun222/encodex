import base64js from 'base64-js';
import { loadFile, fileNameWithExtension } from '@/src/util/files';

export const convertToBase64 = async ({ id, mimeType }: { id: string, mimeType: string }) => {
  return `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(id, mimeType), 'output'))}`;
}