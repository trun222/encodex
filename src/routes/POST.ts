import { ResizeSchema, ThumbnailSchema, ReduceSchema, QualitySchema, MoonlightSchema, FormatSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Reduce, Quality, Thumbnail, Format, Moonlight, Sharpen, Average, Collage, Gray } from '@/src/util/commands';
import { loadFile, writeFile, loadFileStream, fileMetaData, fileNameWithExtension, CHUNK_SIZE } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';
import * as Sentry from '@sentry/node';
import base64js from 'base64-js';

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
      return {
        message: 'Failed to sign up user'
      };
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
      return {
        message: 'Failed to upload file'
      };
    }
  });

  server.post('/resize', ResizeSchema, async (request: any, reply) => {
    const id = (request?.body as any)?.id;

    try {
      const height = (request?.body as any)?.height;
      const width = (request?.body as any)?.width;
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      await Resize({
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
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  })

  server.post('/quality', QualitySchema, async (request, reply) => {
    const id = (request?.body as any)?.id;

    try {
      const quality = (request?.body as any)?.quality;
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      await Quality({
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
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/moonlight', MoonlightSchema, async (request, reply) => {
    const id = (request?.body as any)?.id;

    try {
      const moonValue = (request?.body as any)?.moonValue;
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      await Moonlight({
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        moonValue,
        mimeType,
      });

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/moonlight)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/sharpen', async (request, reply) => {
    const id = (request?.body as any)?.id;

    try {
      const sharpenValue = (request?.body as any)?.sharpenValue;
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      await Sharpen({
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        sharpenValue,
        mimeType,
      });

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/sharpen)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/average', async (request, reply) => {
    const id = (request?.body as any)?.id;

    try {
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      await Average({
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        mimeType,
      });

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/average)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/gray', async (request, reply) => {
    const id = (request?.body as any)?.id;

    try {
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      await Gray({
        inputFileName: fileNameWithExtension(id, mimeType),
        outputFileName,
        mimeType,
      });

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/gray)', 'error');
      return {
        message: `Failed to find file with id ${id}`
      };
    }
  });

  server.post('/collage', async (request, reply) => {
    const idOne = (request?.body as any)?.idOne;
    const idTwo = (request?.body as any)?.idTwo;

    try {
      const outputFileName = (request?.body as any)?.outputFileName;
      const mimeType = (request?.body as any)?.mimeType;

      await Collage({
        inputFileNameOne: fileNameWithExtension(idOne, mimeType),
        inputFileNameTwo: fileNameWithExtension(idTwo, mimeType),
        outputFileName,
        mimeType,
      });

      const convertedBase64 = `data:${mimeType};base64, ${base64js.fromByteArray(await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output'))}`;
      return await UpdateUsage(request, Prisma, {
        file: convertedBase64
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/collage)', 'error');
      return {
        message: `Failed to find file with id ${idOne} or ${idTwo}`
      };
    }
  });


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