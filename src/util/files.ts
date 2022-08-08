import fs from 'fs/promises';

export const loadFile = async (filePath: string): Promise<Buffer> => {
  return await fs.readFile(filePath);
}