import UserPrisma from '@/src/lib/User.prisma';
import { ResizeSchema, ThumbnailSchema, ReduceSchema, QualitySchema, FormatSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Reduce, Quality, Thumbnail, Format } from '@/src/util/commands';
import { loadFile, writeFile, fileNameWithExtension } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';

export default (server) => {
  // Only use the instance once
  const Prisma = new UserPrisma();

  server.post('/signup', async (request, reply) => {
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
  });

  server.post('/resize', ResizeSchema, async (request: any, reply) => {
    const name = (request?.body as any)?.file?.name;
    const data = (request?.body as any)?.file?.data;
    const mimeType = (request?.body as any)?.file?.mimetype;
    // const contentSize = (request?.body as any)?.file?.size;
    const height = (request?.body as any)?.height;
    const width = (request?.body as any)?.width;
    const outputFileName = (request?.body as any)?.outputFileName;

    if (name && data) {
      await writeFile(name, './media', data);
    }

    Resize({
      dimensions: `${width}x${height}`,
      inputFileName: name,
      outputFileName,
      mimeType,
    })

    return UpdateUsage(request, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  })

  server.post('/thumbnail', ThumbnailSchema, async (request, reply) => {
    const name = (request?.body as any)?.file?.name;
    const data = (request?.body as any)?.file?.data;
    const mimeType = (request?.body as any)?.file?.mimetype;
    const outputFileName = (request?.body as any)?.outputFileName;
    const height = (request?.body as any)?.height;
    const width = (request?.body as any)?.width;

    if (name && data) {
      await writeFile(name, './media', data);
    }

    Thumbnail({
      dimensions: `${width}x${height}`,
      inputFileName: name,
      outputFileName,
      mimeType
    })

    return UpdateUsage(request, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  })

  server.post('/reduce', ReduceSchema, async (request, reply) => {
    const name = (request?.body as any)?.file?.name;
    const data = (request?.body as any)?.file?.data;
    const percentage = (request?.body as any)?.percentage;
    const mimeType = (request?.body as any)?.file?.mimetype;
    const outputFileName = (request?.body as any)?.outputFileName;

    if (name && data) {
      await writeFile(name, './media', data);
    }

    Reduce({
      inputFileName: name,
      outputFileName,
      percentage,
      mimeType
    });

    return UpdateUsage(request, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  })

  server.post('/quality', QualitySchema, async (request, reply) => {
    const name = (request?.body as any)?.file?.name;
    const data = (request?.body as any)?.file?.data;
    const mimeType = (request?.body as any)?.file?.mimetype;
    const quality = (request?.body as any)?.quality;
    const outputFileName = (request?.body as any)?.outputFileName;

    if (name && data) {
      await writeFile(name, './media', data);
    }

    Quality({
      inputFileName: name,
      outputFileName,
      quality,
      mimeType,
    });

    return UpdateUsage(request, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  });

  server.post('/format', FormatSchema, async (request, reply) => {
    const name = (request?.body as any)?.file?.name;
    const data = (request?.body as any)?.file?.data;
    const outputFileName = (request?.body as any)?.outputFileName;
    const format = (request?.body as any)?.format;

    if (name && data) {
      await writeFile(name, './media', data);
    }

    Format({
      inputFileName: name,
      outputFileName,
      mimeType: format,
    });

    return UpdateUsage(request, { file: await loadFile(fileNameWithExtension(outputFileName, format), 'output') });
  });
}