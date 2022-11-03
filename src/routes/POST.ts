import { ResizeSchema, QualitySchema, MoonlightSchema, SignupSchema, UploadSchema, SharpenSchema, NoExtraParamsSchema, CollageSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Quality, Moonlight, Sharpen, Average, Collage, Gray } from '@/src/util/commands';
import { loadFile, writeFile, fileNameWithExtension } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';
import * as Sentry from '@sentry/node';
import { convertToBase64 } from '@/src/util/convert';
import { handleUpload } from '@/src/services/upload.service';
// import StripePrisma from '@/src/db/Stripe.prisma';
import { inputPath } from '@/src/util/files';
import CloudConnectionPrisma from '@/src/db/CloudConnection.prisma';

// TODO: 
// 1. Support both uploadId and fileURL for all actions.Return values should also support file URLs.
// 2. Add usage to everything

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

  server.post('/cloudConnection', async (request, reply) => {
    try {
      const bucket = (request.body as any)?.bucket;
      const region = (request.body as any)?.region;
      const provider = (request.body as any)?.provider;
      const accessKey = (request.body as any)?.accessKey;
      const secretKey = (request.body as any)?.secretKey;
      const user = request.headers.user;

      const connection = await cloudConnectionPrisma.createConnection({
        userId: user.id,
        provider,
        bucket,
        region,
        accessKey,
        secretKey,
      });

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

  server.post('/upload', UploadSchema, async (request, reply) => await handleUpload(request, reply, Prisma));

  server.post('/resize', ResizeSchema, async (request: any, reply) => {
    const id = (request?.body as any)?.id || uuidv4();
    const url = (request?.body as any)?.url;
    const isURL = !!url;

    try {
      const height = (request?.body as any)?.height;
      const width = (request?.body as any)?.width;
      const mimeType = (request?.body as any)?.mimeType;
      const platform = (request?.body as any)?.platform || PLATFORM.WEB;
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