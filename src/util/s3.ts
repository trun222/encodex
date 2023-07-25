import {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import md5 from 'md5';
import { statSync } from 'fs';
import { CHUNK_SIZE } from '@/src/util/files';
import { File } from '@/src/interfaces/Common.interface';

const LARGE_FILE = 10 * 1024 * 1024;

export interface Chunk {
  workspaceId: string;
  userId: string;
  fileName: string;
  fieldName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  chunkNumber: number;
  numberOfChunks: number;
  size: number;
  status: string;
  uploadId?: string;
}

export class S3 {
  private client;
  private connection;
  private bucket;
  private region = 'us-east-1';

  constructor(connection: any) {
    this.client = new S3Client(connection);
    this.connection = connection;
    this.bucket = this.connection?.bucket;
    this.region = this.connection?.region;
  }

  async handleFileUpload({ file, fileURI, mimeType }: { file: File, fileURI: string, mimeType: string }) {
    const fileSize = file.size;
    const isLargeFile = fileSize >= LARGE_FILE;

    if (isLargeFile) {
      const { Key, UploadId } = await this.client.send(
        new CreateMultipartUploadCommand({
          Bucket: this.bucket,
          Key: fileURI,
          ACL: 'public-read',
        })
      );

      const uploadedParts = await this.uploadFileChunks(file, {
        key: Key,
        assetId: UploadId
      })

      const completedUpload = await this.completeMultiPartUpload({ Key, UploadId }, uploadedParts);

      return { url: completedUpload?.Location };
    } else {
      return await this.uploadFile({
        file: file.data,
        fileURI,
        contentType: mimeType
      })
    }
  }

  async startMultiPartUpload(fileURI: string, chunkCount: number) {
    try {
      const { UploadId } = await this.client.send(
        new CreateMultipartUploadCommand({
          Bucket: this.bucket,
          Key: fileURI,
          ACL: 'public-read',
        })
      );

      const signedUrls = await Promise.all(
        Array.from(
          {
            length: chunkCount,
          },
          (_, i) =>
            getSignedUrl(
              this.client,
              new UploadPartCommand({
                Bucket: this.bucket,
                Key: fileURI,
                UploadId,
                PartNumber: i + 1,
              })
            )
        )
      );
      return { signedUrls: signedUrls, assetId: UploadId!, key: fileURI };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  async completeMultiPartUpload(
    startUpload: {
      Key: string;
      UploadId: string;
    },
    partsList: any[]
  ): Promise<any> {
    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: startUpload.Key,
        UploadId: startUpload.UploadId,
        MultipartUpload: {
          Parts: partsList,
        },
      });
      return await this.client.send(command);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  async abortMultiPartUpload(
    key: string,
    uploadId: string
  ): Promise<any> {
    try {
      const command = new AbortMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
      });
      return await this.client.send(command);
    } catch (e) {
      throw e;
    }
  };

  async uploadFile({ file, fileURI, contentType }: { file: Buffer, fileURI: string, contentType: string }) {
    try {
      const Command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileURI,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read',
      });
      await this.client.send(Command);
      return { url: this.createBucketUrl(fileURI), key: fileURI };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  async uploadPart(
    fileChunk: any,
    chunkNumber: number,
    sha: string,
    startUpload: {
      key: string;
      assetId: string;
    },
  ): Promise<any> {
    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: startUpload?.key,
      UploadId: startUpload?.assetId,
      PartNumber: chunkNumber,
      ContentMD5: sha,
      ContentLength: fileChunk.length,
      Body: fileChunk,
    });
    return await this.client.send(command);
  }

  createChunks(file: File, chunkSize: number) {
    let startPointer = 0;
    let endPointer = file.size;
    let chunks: any = [];

    while (startPointer < endPointer) {
      let newStartPointer = startPointer + chunkSize;
      chunks.push(file.data.slice(startPointer, newStartPointer));
      startPointer = newStartPointer;
    }
    return chunks;
  }

  async uploadFileChunks(file: File, startUpload: { key: string, assetId: string }) {
    const sha1s: any[] = [];
    const chunks = this.createChunks(file, CHUNK_SIZE);
    let chunkNumber = 1;
    for await (let chunk of chunks) {
      // console.log(`${chunkNumber} of ${chunks}`)
      // (Step 3) Get Upload Part URL
      const sha1 = this.calculateMD5(chunk);
      // (Step 4) Upload File Part
      const uploadedChunk = await this.uploadPart(chunk, chunkNumber, sha1, startUpload);
      sha1s.push({
        ETag: uploadedChunk.ETag,
        PartNumber: chunkNumber,
      });
      chunkNumber++;
    }
    return sha1s;
  }

  createBucketUrl(key: string) {
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  };

  calculateMD5(chunk: Buffer) {
    return Buffer.from(md5(chunk), 'hex').toString('base64');
  }

  calculateNumberOfChunksNoFile = (fileSize: number, chunkSize: number) => {
    const fileSizeInBytes = fileSize;
    return Math.ceil((fileSizeInBytes / chunkSize));
  }

  calculateNumberOfChunks = (fileName: string, chunkSize: number) => {
    const stats = statSync(fileName);
    const fileSizeInBytes = stats.size;
    return Math.ceil((fileSizeInBytes / chunkSize));
  }

  calculateChunkSize(fileName: string, chunkSize: number) {
    const stats = statSync(fileName);
    const MAXIMUM_PARTS_SIZE = 10000;
    const MINIMUM_CHUNK_SIZE = 5000000;
    const fileSizeInBytes = stats.size;

    const calculatedPartsNotSatisfied = Math.ceil((fileSizeInBytes / chunkSize)) >= MAXIMUM_PARTS_SIZE;

    if (chunkSize < MINIMUM_CHUNK_SIZE) {
      return { status: 'insufficient_chunk_size', msg: 'Chunk size must be atleast 5MB', code: 400 };
    }

    // Case 1: fileSizeInBytes is less than 10 MB's minimum for file upload of two parts at 5 MB a piece
    if (fileSizeInBytes < MINIMUM_CHUNK_SIZE * 2) {
      return { status: 'insufficient_file_size', msg: 'The file must be atleast 10MB in size.', code: 400 };
      // Case 2: file is very large and the chunk size exceeds to Maximum 10,000 parts
    } else if (calculatedPartsNotSatisfied) {
      // Increase the chunk size until the calculatedParts is satisfied
      let acceptableChunkSIze: number = chunkSize;
      while (Math.ceil((fileSizeInBytes / acceptableChunkSIze)) >= MAXIMUM_PARTS_SIZE) {
        acceptableChunkSIze * 2;
      }
      return acceptableChunkSIze;
      // Case 3: file fits within the chunk size and parts requirements
    } else {
      return chunkSize;
    }

  }
}
