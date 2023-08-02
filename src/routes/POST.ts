import { ResizeSchema, QualitySchema, MoonlightSchema, SignupSchema, UploadSchema, SharpenSchema, NoExtraParamsSchema, CollageSchema, CreateCloudConnectionSchema, EncodeSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Quality, Moonlight, Sharpen, Average, Collage, Gray, Encode } from '@/src/util/commands';
import { loadFile, fileNameWithExtension, loadFileSync } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';
import * as Sentry from '@sentry/node';
import { convertToBase64 } from '@/src/util/convert';
import { handleUpload, handleCloudUpload, checkCloudConnection } from '@/src/services/upload.service';
// import StripePrisma from '@/src/db/Stripe.prisma';
import { inputPath } from '@/src/util/files';
import CloudConnectionPrisma from '@/src/db/CloudConnection.prisma';
import { HostedEnum } from '@/src/interfaces/Cloud.interface';
import { onEncodedComplete } from '@/src/util/hooks';
import { S3 } from '@/src/util/s3';
import fs from 'fs';

enum PLATFORM {
  WEB = 'WEB',
  SERVER = 'SERVER'
}

const cloudConnectionPrisma: any = new CloudConnectionPrisma();

export default async function POST(server, Prisma) {
  server.post('/signup', SignupSchema, async (request, reply) => {
    try {
      const { email }: any = request?.body;
      const isUser = await Prisma.getUser({ email });

      if (isUser?.id) {
        reply.code(400).send({
          message: 'User already exists',
        });
      }

      const apiToken = uuidv4();
      const user = await Prisma.createUser({ email, token: apiToken });

      return {
        id: user.id,
        email: user.email,
        usage: user?.usage,
        token: apiToken,
      }
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/signup)', 'error');
      return {
        message: 'Failed to sign up user'
      };
    }
  });

  server.post('/cloudConnection', CreateCloudConnectionSchema, async (request, reply) => {
    try {
      const user = request.headers.user;
      // ALL
      const provider = (request.body as any)?.provider;
      // AWS
      const bucket = (request.body as any)?.bucket;
      const accessKey = (request.body as any)?.accessKey;
      const secretKey = (request.body as any)?.secretKey;
      const region = (request.body as any)?.region;
      // AZURE
      const accountName = (request.body as any)?.accountName;
      const accountAccessKey = (request.body as any)?.accountAccessKey;
      // GCP
      const clientEmail = (request.body as any)?.clientEmail;
      const privateKey = (request.body as any)?.privateKey;

      let connection;

      if (provider === HostedEnum.AWS) {
        // TODO: Ensure all AWS properties are set or send back error
        connection = await cloudConnectionPrisma.createConnectionAWS({
          userId: user.id,
          provider,
          bucket,
          region,
          accessKey,
          secretKey,
        });
      } else if (provider === HostedEnum.AZURE) {
        // TODO: Ensure all AZURE properties are set or send back error
        connection = await cloudConnectionPrisma.createConnectionAzure({
          userId: user.id,
          provider,
          accountName,
          accountAccessKey
        });
      } else if (provider === HostedEnum.GCP) {
        // TODO: Ensure all GCP properties are set or send back error
        connection = await cloudConnectionPrisma.createConnectionGCP({
          userId: user.id,
          provider,
          bucket,
          clientEmail,
          privateKey
        })
      }

      return await UpdateUsage(request, Prisma, {
        id: connection?.id
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/cloudConnection)', 'error');
      return {
        message: `Failed to create new cloud connection`
      };
    }
  })

  // TODO: Add large file abort endpoint

  // TODO: Deny Large File Uploads and force them to use large file upload endpoint
  server.post('/upload', UploadSchema, async (request, reply) => await handleUpload(request, reply, Prisma));

  // TODO: Force Users to use this for large file uploads
  server.post('/start-large-upload', async (request, reply) => {
    try {
      const fileURI = request.body.fileURI;
      const fileSize = request.body.fileSize;
      const connectionId = request.body.connectionId;

      const connection = await cloudConnectionPrisma.getConnection({
        connectionId: parseInt(connectionId, 10)
      });

      // Ensure the user is the owner of the connection
      checkCloudConnection(request, connection);

      const s3 = new S3({
        credentials: {
          accessKeyId: connection?.accessKey,
          secretAccessKey: connection?.secretKey,
        },
        bucket: connection?.bucket,
        region: connection?.region
      });

      const startMultiPartUpload = await s3.startMultiPartUpload(fileURI, fileSize);
      return startMultiPartUpload;
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/start-large-upload)', 'error');
      console.log(e);
      return {
        message: 'Failed to start large file upload'
      };
    }
  });

  server.post('/test-large-upload', async (request, reply) => {
    try {
      const fileURI = request.body.fileURI;
      const signedURLs = request.body.signedURLs;
      const assetId = request.body.assetId;
      const key = request.body.key;
      const connectionId = request.body.connectionId;

      const connection = await cloudConnectionPrisma.getConnection({
        connectionId: parseInt(connectionId, 10)
      });

      // Ensure the user is the owner of the connection
      checkCloudConnection(request, connection);

      const s3 = new S3({
        credentials: {
          accessKeyId: connection?.accessKey,
          secretAccessKey: connection?.secretKey,
        },
        bucket: connection?.bucket,
        region: connection?.region
      });

      // NOTE: Technically this can be decoupled from Cloud Provider specific upload
      // Only the completeMultipartUpload needs to be provider specific
      const uploaded = await s3.uploadChunks(fileURI, signedURLs, key, assetId);
      return {
        parts: uploaded,
        assetId,
        key,
      };
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/test-large-upload)', 'error');
      return {
        message: 'Failed to complete large file upload'
      };
    }
  });



  server.post('/complete-large-upload', async (request, reply) => {
    try {
      const parts = request.body.parts;
      const assetId = request.body.assetId;
      const key = request.body.key;
      const connectionId = request.body.connectionId;

      const connection = await cloudConnectionPrisma.getConnection({
        connectionId: parseInt(connectionId, 10)
      });

      // Ensure the user is the owner of the connection
      checkCloudConnection(request, connection);

      const s3 = new S3({
        credentials: {
          accessKeyId: connection?.accessKey,
          secretAccessKey: connection?.secretKey,
        },
        bucket: connection?.bucket,
        region: connection?.region
      });

      const completed = await s3.completeMultiPartUpload({ Key: key, UploadId: assetId }, parts);
      return completed;
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/complete-large-upload)', 'error');
      return {
        message: 'Failed to complete large file upload'
      };
    }
  });


  server.post('/resize', ResizeSchema, async (request: any, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;

    try {
      const height = (request?.body as any)?.height;
      const width = (request?.body as any)?.width;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      // Why require mimeType? Since the file is already uploaded
      const inputFileName = isURL ? url : inputPath(fileNameWithExtension(id, mimeType));

      await Resize({
        dimensions: `${width}x${height}`,
        inputFileName,
        outputFileName: id,
        mimeType,
      })

      return await UpdateUsage(request, Prisma, {
        file: platform === PLATFORM.WEB ? await convertToBase64({ id, mimeType }) : await loadFile(fileNameWithExtension(id, mimeType), 'output')
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/resize)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  })

  server.post('/quality', QualitySchema, async (request, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;

    try {
      const quality = (request?.body as any)?.quality;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      const inputFileName = isURL ? url : inputPath(fileNameWithExtension(id, mimeType));

      await Quality({
        inputFileName,
        outputFileName: id,
        quality,
        mimeType,
      });

      return await UpdateUsage(request, Prisma, {
        file: platform === PLATFORM.WEB ? await convertToBase64({ id, mimeType }) : await loadFile(fileNameWithExtension(id, mimeType), 'output')
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/quality)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/moonlight', MoonlightSchema, async (request, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;

    try {
      const moonValue = (request?.body as any)?.moonValue;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      const inputFileName = isURL ? url : inputPath(fileNameWithExtension(id, mimeType));

      await Moonlight({
        inputFileName,
        outputFileName: id,
        moonValue,
        mimeType,
      });

      return await UpdateUsage(request, Prisma, {
        file: platform === PLATFORM.WEB ? await convertToBase64({ id, mimeType }) : await loadFile(fileNameWithExtension(id, mimeType), 'output')
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/moonlight)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/sharpen', SharpenSchema, async (request, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;

    try {
      const sharpenValue = (request?.body as any)?.sharpenValue;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      const inputFileName = isURL ? url : inputPath(fileNameWithExtension(id, mimeType));

      await Sharpen({
        inputFileName,
        outputFileName: id,
        sharpenValue,
        mimeType,
      });

      return await UpdateUsage(request, Prisma, {
        file: platform === PLATFORM.WEB ? await convertToBase64({ id, mimeType }) : await loadFile(fileNameWithExtension(id, mimeType), 'output')
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/sharpen)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/average', NoExtraParamsSchema, async (request, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;

    try {
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      const inputFileName = isURL ? url : inputPath(fileNameWithExtension(id, mimeType));

      await Average({
        inputFileName,
        outputFileName: id,
        mimeType,
      });

      return await UpdateUsage(request, Prisma, {
        file: platform === PLATFORM.WEB ? await convertToBase64({ id, mimeType }) : await loadFile(fileNameWithExtension(id, mimeType), 'output')
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/average)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/gray', NoExtraParamsSchema, async (request, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;

    try {
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      const mimeType = (request?.body as any)?.mimeType;
      const inputFileName = isURL ? url : inputPath(fileNameWithExtension(id, mimeType));

      await Gray({
        inputFileName,
        outputFileName: id,
        mimeType,
      });

      return await UpdateUsage(request, Prisma, {
        file: platform === PLATFORM.WEB ? await convertToBase64({ id, mimeType }) : await loadFile(fileNameWithExtension(id, mimeType), 'output')
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/gray)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/collage', CollageSchema, async (request, reply) => {
    const idOne = (request?.body as any)?.idOne;
    const idTwo = (request?.body as any)?.idTwo;
    const urlOne = (request?.body as any)?.urlOne;
    const urlTwo = (request?.body as any)?.urlTwo;
    const isURL = !!(urlOne && urlTwo);
    const combinedId = idOne + idTwo;

    try {
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      const inputFileNameOne = isURL ? urlOne : inputPath(fileNameWithExtension(idOne, mimeType));
      const inputFileNameTwo = isURL ? urlTwo : inputPath(fileNameWithExtension(idTwo, mimeType));

      await Collage({
        inputFileNameOne,
        inputFileNameTwo,
        outputFileName: combinedId,
        mimeType,
      });

      return await UpdateUsage(request, Prisma, {
        file: platform === PLATFORM.WEB ? await convertToBase64({
          id: combinedId, mimeType
        }) : await loadFile(fileNameWithExtension(combinedId, mimeType), 'output')
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/collage)', 'error');
      return {
        message: `Failed to find file with id ${idOne} or ${idTwo}`
      };
    }
  });

  server.post('/encode', EncodeSchema, async (request: any, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;
    const format = (request?.body as any)?.format;
    const mimeType = (request?.body as any)?.mimeType;
    const inputFileName = isURL ? url : inputPath(fileNameWithExtension(id, mimeType));
    const connectionId = (request.body as any)?.connectionId;
    const connection = await cloudConnectionPrisma.getConnection({
      connectionId: parseInt(connectionId, 10)
    });
    const fileURI = (request.body as any)?.fileURI;
    const webhookURL = (request.body as any)?.webhookURL;
    // Ensure the user is the owner of the connection
    checkCloudConnection(request, connection);

    try {
      Encode({
        inputFileName,
        outputFileName: id,
        mimeType,
        format,
      }).then(async () => {
        console.log('The file was encoded successfully');
        const file: any = loadFileSync(id, mimeType);
        console.log(file.data.length);
        file.data = file;
        const uploaded = await handleCloudUpload(request, connection, file, fileURI, mimeType);
        console.log({ uploaded })
        onEncodedComplete(uploaded, webhookURL);
      }).catch(e => console.log({ e }));

      return {
        message: `Your file with id ${id} is being encoded.`
      };
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/encode)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  })

  // TODO: Hold off on
  // server.post('/format', FormatSchema, async (request, reply) => {
  //   try {
  //     const id = (request?.body as any)?.id;
  //     const outputFileName = (request?.body as any)?.outputFileName;
  //     const format = (request?.body as any)?.format;
  //     const mimeType = (request?.body as any)?.mimeType;

  //     Format({
  //       inputFileName: fileNameWithExtension(id, mimeType),
  //       outputFileName,
  //       mimeType: format,
  //     });

  //     return await UpdateUsage(request, Prisma, { file: await loadFile(fileNameWithExtension(outputFileName, format), 'output') });
  //   } catch (e) {
  //     Sentry.captureException(e);
  //     Sentry.captureMessage('[POST](/format)', 'error');
  //     return;
  //   }
  // });
};