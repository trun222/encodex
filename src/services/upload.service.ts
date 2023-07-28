import { ExtensionToMime } from '@/src/util/mimeTypes';
import { GCPStorage } from '@/src/util/gcpStorage';
import { Hosted } from '@/src/interfaces/Cloud.interface';
import { S3 } from '@/src/util/s3';
import * as Sentry from '@sentry/node';
import { writeFile, fileNameWithExtension } from '@/src/util/files';
import { v4 as uuidv4 } from 'uuid';
import CloudConnectionPrisma from '@/src/db/CloudConnection.prisma';
import { UpdateUsage } from '@/src/util/usage';
import { File } from '@/src/interfaces/Common.interface';
import axios from 'axios';
import { AzureBlob } from '@/src/util/azureBlob';
import { HostedEnum } from '@/src/interfaces/Cloud.interface';
import { UsageLimits } from '@/src/util/usage';

const cloudConnectionPrisma: any = new CloudConnectionPrisma();

export async function handleSetFile({ isURL, url, request }: { isURL: boolean, url: string, request: any }) {
  const membership = (request?.headers.user as any)?.membership;

  const file = isURL ? (await axios.get(url, {
    responseType: 'arraybuffer',
    decompress: false,
  })) : (request.body as any)?.file;

  if (isURL) {
    if (file.data.length >= UsageLimits[membership].maxFileSize) {
      throw new Error('Max File size exceeded.');
    }
  } else {
    if (file.size >= UsageLimits[membership].maxFileSize) {
      throw new Error('Max File size exceeded.');
    }
  }

  return file;
}

export async function handleUpload(request: any, reply: any, prisma: any) {
  const connectionId: Hosted = (request.body as any)?.connectionId;
  const isCloud: boolean = !!connectionId;

  if (isCloud) {
    return await handleCloud(request, reply, prisma);
  } else {
    return await handleDefault(request, reply, prisma);
  }
}

export async function handleCloud(request: any, reply: any, prisma: any) {
  try {
    // File
    const fileURI = (request.body as any)?.fileURI;
    const url = (request?.body as any)?.url;
    const isURL = !!url;
    const file: File = await handleSetFile({ request, url, isURL });
    const mimeType = isURL ? (request.body as any)?.mimeType : (request.body as any)?.file?.mimetype;
    // Cloud
    const connectionId = (request.body as any)?.connectionId;

    const connection = await cloudConnectionPrisma.getConnection({
      connectionId: parseInt(connectionId, 10)
    });

    const uploaded = await handleCloudUpload(request, connection, file, fileURI, mimeType);

    return await UpdateUsage(request, prisma, {
      fileURL: uploaded.url,
      metadata: {
        name: file.name,
        mimeType,
        size: file.size,
      }
    });
  } catch (e) {
    Sentry.captureException(e);
    Sentry.captureMessage('[upload.service.ts](handleCloud)', 'error');
    if (e instanceof Error)
      return {
        message: e?.message
      };
  }
}

export async function handleDefault(request: any, reply: any, prisma: any) {
  try {
    const uploadId = uuidv4();
    // For URL
    const url = (request?.body as any)?.url;
    const isURL = !!url;
    const splitURL = url && url.split('.');
    const extension = splitURL && `.${splitURL[splitURL.length - 1]}`;
    const mimeType = isURL ? ExtensionToMime[extension] : (request.body as any)?.file?.mimetype;
    const file: File = await handleSetFile({ request, url, isURL });

    if (file) {
      await writeFile(fileNameWithExtension(uploadId, mimeType), './media', file?.data);
    }

    return await UpdateUsage(request, prisma, {
      uploadId,
      metadata: {
        name: file.name,
        mimeType,
        size: file.size,
      }
    });
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    Sentry.captureMessage('[upload.service.ts](handleDefault)', 'error');
    return {
      message: 'Failed to upload file'
    };
  }
}

export async function handleCloudUpload(request: any, connection: any, file: any, fileURI: string, mimeType: string): Promise<any | { message: string }> {
  try {
    // Ensure someone doesn't try to fetch someone else's cloud connection
    checkCloudConnection(request, connection);

    // TODO: Handle selecting provider type
    if (connection?.provider === HostedEnum.AWS) {
      const s3 = new S3({
        credentials: {
          accessKeyId: connection?.accessKey,
          secretAccessKey: connection?.secretKey,
        },
        bucket: connection?.bucket,
        region: connection?.region
      });

      return await s3.handleFileUpload({
        file,
        fileURI,
        mimeType,
      })
    } else if (connection?.provider === HostedEnum.AZURE) {
      const azure = new AzureBlob()

      return await azure.handleFileUpload({
        file,
        fileURI,
        accountName: connection?.accountName,
        accountAccessKey: connection?.accountAccessKey
      });
    } else if (connection?.provider === HostedEnum.GCP) {
      const gcp = new GCPStorage();

      return await gcp.handleFileUpload({
        file,
        fileURI,
        bucket: connection?.bucket,
        clientEmail: connection?.clientEmail,
        privateKey: connection?.privateKey
      })
    }
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    Sentry.captureMessage('[upload.service.ts](handleCloudUpload)', 'error');
    return {
      message: 'Failed to upload file to cloud'
    };
  }
}

export function checkCloudConnection(request: any, connection: any) {
  // Ensure someone doesn't try to fetch someone else's cloud connection
  const user = request.headers.user;
  if (user.id !== connection?.userId) {
    throw Error(`This connection is not associated with this user.`);
  }
  return;
}