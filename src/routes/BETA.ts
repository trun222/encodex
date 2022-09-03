import { S3 } from './../util/s3';
import { ResizeSchema, QualitySchema, FormatSchema } from '@/src/validation/request.schema';
import { v4 as uuidv4 } from 'uuid';
import { Resize, Reduce, Quality, Thumbnail, Format } from '@/src/util/commands';
import { loadFile, writeFile, loadFileStream, fileMetaData, fileNameWithExtension, CHUNK_SIZE } from '@/src/util/files';
import { UpdateUsage } from '@/src/util/usage';

const s3 = new S3();

export default async function BETA(server, Prisma) {
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
};