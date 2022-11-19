import { app } from '@/src/index';
import axios, { AxiosError } from 'axios';

let server;

beforeAll(async () => {
  server = await app();
})

describe('Request Valdidation (Token)', () => {
  test('Missing token response', async () => {
    try {
      let result = (await axios.get('http://localhost:7777/')).data;
    } catch (e) {
      if (e instanceof AxiosError) {
        expect(e?.response?.status).toBe(400);
        expect(e?.response?.data).toStrictEqual({ message: 'Missing token' });
      }
    }
  });

  test('Invalid token response', async () => {
    try {
      let result = (await axios.get('http://localhost:7777/', {
        headers: {
          token: '123123123'
        }
      })).data;
    } catch (e) {
      if (e instanceof AxiosError) {
        expect(e?.response?.status).toBe(400);
        expect(e?.response?.data).toStrictEqual({ message: 'Invalid token' });
      }
    }
  });

  test('Valid token response', async () => {
    let result = await axios.get('http://localhost:7777/user', {
      headers: {
        token: '4a147ec2-71d8-4c1c-8fa6-410d0a4dc5b9'
      }
    });
    expect(result.status).toBe(200);
    expect(result.data.token).toStrictEqual('4a147ec2-71d8-4c1c-8fa6-410d0a4dc5b9');
  });
})

afterAll(async () => {
  server.close();
});