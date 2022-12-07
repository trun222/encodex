import { UsageLimits } from '@/src/util/usage';
import UserPrisma, { UsageType } from '@/src/db/User.prisma';
import { app } from '@/src/index';
import axios, { AxiosError } from 'axios';

let server;
let userPrisma;

const tinyFile = 'https://scalor.s3.amazonaws.com/testing-resources/tiny_file.jpg';
const mediumFile = 'https://scalor.s3.amazonaws.com/testing-resources/medium_file.jpg';
const largeFile = 'https://scalor.s3.amazonaws.com/testing-resources/large_file.jpg';

beforeAll(async () => {
  server = await app();
  userPrisma = new UserPrisma();
})

describe('File', () => {
  test('File size exceeded for local upload', async () => {
    let result = await axios.post('http://localhost:7777/upload', {
      connectionId: 11,
      fileURI: 'test/wedding.jpg',
      url: largeFile,
      mimeType: 'image/jpg'
    }, {
      headers: {
        "Content-Type": "multipart/form-data",
        token: '4a147ec2-71d8-4c1c-8fa6-410d0a4dc5b9',
      }
    });
    expect(result.status).toBe(200);
    expect(result?.data).toStrictEqual({
      "message": "Max File size exceeded."
    });
  });
})

afterAll(async () => {
  server.close();
});