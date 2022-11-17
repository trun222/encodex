import { Storage } from '@google-cloud/storage';

export class GCPStorage {
  constructor() { }

  async handleFileUpload({ file, fileURI, bucket, clientEmail, privateKey }: { file: any, fileURI: string, bucket: string, clientEmail: string, privateKey: string }) {
    try {
      const storage = new Storage({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey
        }
      });

      const uploaded = await storage.bucket(bucket).file(fileURI).save(file?.data);

      return {
        url: `https://storage.cloud.google.com/${bucket}/${fileURI}`
      }
    } catch (e) {
      console.log('Error handleFileUpload: ', e);
      return e;
    }
  }
}
