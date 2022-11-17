import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { File } from '@/src/interfaces/Common.interface';

export class AzureBlob {
  constructor() { }

  async handleFileUpload({ file, fileURI, accountName, accountAccessKey }: { file: File, fileURI: string, accountName: string, accountAccessKey: string }) {
    try {
      const [blobContainer, fileName] = fileURI.split('/');
      const sharedKey = new StorageSharedKeyCredential(accountName, accountAccessKey);
      const client = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKey
      );
      const container = client.getContainerClient(blobContainer);
      const blockBlobClient = container.getBlockBlobClient(fileName);
      await blockBlobClient.upload(file.data, file.size || file.data.length);

      return {
        url: `https://${accountName}.blob.core.windows.net/${blobContainer}/${fileName}`
      }
    } catch (e) {
      console.log('Error handleFileUpload: ', e);
      return e;
    }
  }
}
