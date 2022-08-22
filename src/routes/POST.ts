import { S3 } from './../util/s3';
import { ResizeSchema, ThumbnailSchema, ReduceSchema, QualitySchema, FormatSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Reduce, Quality, Thumbnail, Format } from '@/src/util/commands';
import { loadFile, writeFile, loadFileStream, fileMetaData, fileNameWithExtension, CHUNK_SIZE } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';
// import { upload_file_chunks } from '@/src/util/s3';

const s3 = new S3();

export default async function POST(server, Prisma) {
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

  // TODO: Ensure usage is calculated and enforced properly for this endpoint
  server.post('/upload', async (request, reply) => {
    const uploadId = uuidv4();
    const name = (request?.body as any)?.file?.name;
    const data = (request?.body as any)?.file?.data;
    const mimeType = (request?.body as any)?.file?.mimetype;

    if (name && data) {
      await writeFile(fileNameWithExtension(uploadId, mimeType), './media', data);
    }

    return {
      uploadId,
    }
  });

  server.post('/storage', async (request, reply) => {
    const { token }: any = request?.headers;
    const uploadId = (request?.body as any)?.id;
    const mimeType = (request?.body as any)?.mimeType;
    const fullFileName = fileNameWithExtension(uploadId, mimeType);
    const fileMeta = await fileMetaData(fullFileName, './media')
    const MIN_FILE_SIZE = 10 * 1024 * 1024;

    if (fileMeta?.size >= MIN_FILE_SIZE) {
      const numberOfChunks = s3.calculateNumberOfChunks(`./media/${fullFileName}`, CHUNK_SIZE);
      const startUpload = await s3.startMultiPartUpload(fullFileName, token, numberOfChunks)
      const uploadedChunks = await s3.upload_file_chunks(fullFileName, numberOfChunks, { ...startUpload, apiToken: token, fileName: fullFileName });
      const completedUpload = await s3.completeMultiPartUpload({
        Key: startUpload?.key,
        UploadId: startUpload?.assetId
      },
        uploadedChunks)
    } else { // For files that are smaller than 10 MBs
      const file = await loadFile(fullFileName, './media');
      const uploaded = await s3.uploadFile({ file, fileName: fullFileName, contentType: mimeType, apiToken: token });
    }

    return {
      uploadId,
    }
  });

  server.post('/resize', ResizeSchema, async (request: any, reply) => {
    const height = (request?.body as any)?.height;
    const width = (request?.body as any)?.width;
    const outputFileName = (request?.body as any)?.outputFileName;
    const id = (request?.body as any)?.id;
    const mimeType = (request?.body as any)?.mimeType;

    Resize({
      dimensions: `${width}x${height}`,
      inputFileName: fileNameWithExtension(id, mimeType),
      outputFileName,
      mimeType,
    })

    return await UpdateUsage(request, Prisma, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  })

  server.post('/thumbnail', ThumbnailSchema, async (request, reply) => {
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

    return await UpdateUsage(request, Prisma, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  })

  server.post('/reduce', ReduceSchema, async (request, reply) => {
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

    return await UpdateUsage(request, Prisma, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  })

  server.post('/quality', QualitySchema, async (request, reply) => {
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

    return await UpdateUsage(request, Prisma, { file: await loadFile(fileNameWithExtension(outputFileName, mimeType), 'output') });
  });

  server.post('/format', FormatSchema, async (request, reply) => {
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
  });
};