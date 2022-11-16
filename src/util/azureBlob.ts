import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import md5 from 'md5';
import { statSync } from 'fs';
import { CHUNK_SIZE } from '@/src/util/files';
import { File } from '@/src/interfaces/Common.interface';

const LARGE_FILE = 10_000;

export interface Chunk {
  workspaceId: string;
  userId: string;
  fileName: string;
  fieldName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  chunkNumber: number;
  numberOfChunks: number;
  size: number;
  status: string;
  uploadId?: string;
}

export class AzureBlob {
  private client;
  private bucket;
  private region;
  private sharedKeyCredential;

  constructor() {
    // this.sharedKeyCredential = new StorageSharedKeyCredential(process?.env?.AZURE_ACCOUNT!, process?.env?.AZURE_ACCOUNT_KEY!);
    // this.client = new BlobServiceClient(
    //   `https://${process?.env?.AZURE_ACCOUNT}.blob.core.windows.net`,
    //   this.sharedKeyCredential
    // );
    // console.log('client: ', this.client);
  }

  async handleFileUpload({ file, fileURI, url, isURL, mimeType }: { file: File, fileURI: string, url: string, isURL: boolean, mimeType: string }) {
    try {
      const fileSize = file.size;
      const isLargeFile = fileSize >= LARGE_FILE;
      const [blobContainer, fileName] = fileURI.split('/');

      // if (isLargeFile) {

      // } else {
      // {
      //   tenantId: '96cd55f8-cb30-437e-b105-76013c9d4f12',
      //     managedIdentityClientId: '147d218e-aa29-4fec-9eec-d9b87fd6ba1d',
      //       managedIdentityClientSecret: 'Gwv8Q~oyh0MeZEjqwSy8QFTmYvxLF1Z-Tbh8BbHH'
      // }

      const accountName = 'scalortest';
      const accountAccessKey = 'Y0et1uiUQWTWb02jlL2k04WsBj2ezkHk+l8efUEq68OhaD09+mceUlAyXqah1IS4W2cik/3jVPvI+ASt3h/A6g==';
      const sharedKey = new StorageSharedKeyCredential(accountName, accountAccessKey);
      const client = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKey
      );
      const container = client.getContainerClient(blobContainer);
      const blockBlobClient = container.getBlockBlobClient(fileName);
      await blockBlobClient.upload(file.data, file.size);

      return {
        url: `https://${accountName}.blob.core.windows.net/${blobContainer}/${fileName}`
      }
      // }
    } catch (e) {
      console.log('Error handleFileUpload: ', e);
      return e;
    }
  }
}
