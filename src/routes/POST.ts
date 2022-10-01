import { ResizeSchema, QualitySchema, MoonlightSchema, SignupSchema, UploadSchema, SharpenSchema, NoExtraParamsSchema, CollageSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Quality, Moonlight, Sharpen, Average, Collage, Gray } from '@/src/util/commands';
import { loadFile, writeFile, fileNameWithExtension } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';
import * as Sentry from '@sentry/node';
import { convertToBase64 } from '@/src/util/convert';

enum PLATFORM {
  WEB = 'WEB',
  SERVER = 'SERVER'
}

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

  server.post('/upload', UploadSchema, async (request, reply) => {
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
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;

      await Resize({
        dimensions: `${width}x${height}`,
        inputFileName: fileNameWithExtension(id, mimeType),
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
    const id = (request?.body as any)?.id;

    try {
      const quality = (request?.body as any)?.quality;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;

      await Quality({
        inputFileName: fileNameWithExtension(id, mimeType),
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
    const id = (request?.body as any)?.id;

    try {
      const moonValue = (request?.body as any)?.moonValue;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;

      await Moonlight({
        inputFileName: fileNameWithExtension(id, mimeType),
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
    const id = (request?.body as any)?.id;

    try {
      const sharpenValue = (request?.body as any)?.sharpenValue;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;

      await Sharpen({
        inputFileName: fileNameWithExtension(id, mimeType),
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
    const id = (request?.body as any)?.id;

    try {
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;

      await Average({
        inputFileName: fileNameWithExtension(id, mimeType),
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
    const id = (request?.body as any)?.id;

    try {
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
      const mimeType = (request?.body as any)?.mimeType;

      await Gray({
        inputFileName: fileNameWithExtension(id, mimeType),
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
    const combinedId = idOne + idTwo;

    try {
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;

      await Collage({
        inputFileNameOne: fileNameWithExtension(idOne, mimeType),
        inputFileNameTwo: fileNameWithExtension(idTwo, mimeType),
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