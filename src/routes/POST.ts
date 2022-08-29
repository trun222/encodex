import { S3 } from './../util/s3';
import { UploadSchema, ResizeSchema, ThumbnailSchema, ReduceSchema, QualitySchema, FormatSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Reduce, Quality, Thumbnail, Format } from '@/src/util/commands';
import { loadFile, writeFile, loadFileStream, fileMetaData, fileNameWithExtension, CHUNK_SIZE } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';
import * as Sentry from '@sentry/node';
import base64js from 'base64-js';

const s3 = new S3();

export default async function POST(server, Prisma) {
  server.post('/signup', async (request, reply) => {
    try {
      const { email, contact }: any = request?.body;
      const isUser = await Prisma.getUser({ email });

      if (isUser?.id) {
        reply.code(400).send({
          message: 'User already exists',
        });
      }

      const apiToken = uuidv4();
      const user = await Prisma.createUser({ email, token: apiToken, contact });

      return {
        id: user.id,
        email: user.email,
        contact: user?.contactInfo,
        usage: user?.usage,
        token: apiToken,
      }
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/signup)', 'error');
      return;
    }
  });

  // TODO: Ensure usage is calculated and enforced properly for this endpoint
  server.post('/upload', async (request, reply) => {
    try {
      const uploadId = uuidv4();
      const name = (request.body as any)?.file?.name;
      const data = (request.body as any)?.file?.data;
      const mimeType = (request.body as any)?.file?.mimetype;

      if (name && data) {
        await writeFile(fileNameWithExtension(uploadId, mimeType), './media', data);
      }

      return {
        uploadId,
      }
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/upload)', 'error');
      return;
    }
  });

  server.post('/resize', ResizeSchema, async (request: any, reply) => {
    try {
      const id = (request?.body as any)?.id;
      const height = (request?.body as any)?.height;
      const width = (request?.body as any)?.width;
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      Resize({
        dimensions: `${width}x${height}`,
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        mimeType,
      })
      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/resize)', 'error');
      return;
    }
  })

  server.post('/thumbnail', ThumbnailSchema, async (request, reply) => {
    try {
      const outputFileName = (request?.body as any)?.outputFileName;
      const height = (request?.body as any)?.height;
      const width = (request?.body as any)?.width;
      const id = (request?.body as any)?.id;
      const mimeType = (request?.body as any)?.mimeType;

      Thumbnail({
        dimensions: `${width}x${height}`,
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        mimeType
      })

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/thumbnail)', 'error');
      return;
    }
  })

  server.post('/reduce', ReduceSchema, async (request, reply) => {
    try {
      const percentage = (request?.body as any)?.percentage;
      const outputFileName = (request?.body as any)?.outputFileName;
      const id = (request?.body as any)?.id;
      const mimeType = (request?.body as any)?.mimeType;

      Reduce({
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        percentage,
        mimeType
      });

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/reduce)', 'error');
      return;
    }
  })

  server.post('/quality', QualitySchema, async (request, reply) => {
    try {
      const quality = (request?.body as any)?.quality;
      const outputFileName = (request?.body as any)?.outputFileName;
      const id = (request?.body as any)?.id;
      const mimeType = (request?.body as any)?.mimeType;

      Quality({
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        quality,
        mimeType,
      });

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/quality)', 'error');
      return;
    }
  });

  server.post('/format', FormatSchema, async (request, reply) => {
    try {
      const outputFileName = (request?.body as any)?.outputFileName;
      const format = (request?.body as any)?.format;
      const id = (request?.body as any)?.id;
      const mimeType = (request?.body as any)?.mimeType;

      Format({
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        mimeType: format,
      });

      return await UpdateUsage(request, Prisma, { file: await loadFile(fileNameWithExtension(outputFileName, format), 'output') });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/format)', 'error');
      return;
    }
  });
};