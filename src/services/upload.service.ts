import { Hosted } from '@/src/interfaces/Cloud.interface';
import { S3 } from '@/src/util/s3';
import * as Sentry from '@sentry/node';
import { writeFile, fileNameWithExtension } from '@/src/util/files';
import { v4 as uuidv4 } from 'uuid';
import CloudConnectionPrisma from '@/src/db/CloudConnection.prisma';
import { UpdateUsage } from '@/src/util/usage';
import { File } from '@/src/interfaces/Common.interface';
import axios from 'axios';

const cloudConnectionPrisma: any = new CloudConnectionPrisma();

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
    const file: File = isURL ? (await axios.get(url, {
      responseType: 'arraybuffer',
      decompress: false,
    })) : (request.body as any)?.file;
    const mimeType = isURL ? (request.body as any)?.mimeType : (request.body as any)?.file?.mimetype;
    // Cloud
    const connectionId = (request.body as any)?.connectionId;
    const user = request.headers.user;

    const connection = await cloudConnectionPrisma.getConnection({
      connectionId: parseInt(connectionId, 10)
    });

    // Ensure someone doesn't try to fetch someone else's cloud connection
    if (user.id !== connection?.userId) {
      return {
        message: `This connection is not associated with this user.`
      };
    }

    // TODO: Add other Cloud Providers.
    const s3 = new S3({
      accessKeyId: connection?.accessKey,
      secretAccessKey: connection?.secretKey,
      bucket: connection?.bucket,
      region: connection?.region
    });

    const uploaded = await s3.handleFileUpload({
      file,
      fileURI,
      url,
      isURL,
      mimeType,
    })

    return await UpdateUsage(request, prisma, {
      fileURL: uploaded.url
    });
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    Sentry.captureMessage('[upload.service.ts](handleCloud)', 'error');
    return {
      message: 'Failed to upload file'
    };
  }
}

export async function handleDefault(request: any, reply: any, prisma: any) {
  try {
    const uploadId = uuidv4();
    const name = (request.body as any)?.file?.name;
    const data = (request.body as any)?.file?.data;
    const mimeType = (request.body as any)?.file?.mimetype;

    if (name && data) {
      await writeFile(fileNameWithExtension(uploadId, mimeType), './media', data);
    }

    return await UpdateUsage(request, prisma, {
      uploadId,
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