import Fastify, { FastifyInstance } from 'fastify'
import { Resize, Reduce, Quality, Thumbnail, Format } from './util/commands';
import { loadFile, writeFile, createFolders } from './util/files';
import fileUpload from 'fastify-file-upload';
import { logger } from '@/src/util/logging';
import { v4 as uuidv4 } from 'uuid';
import UserPrisma, { UsageType } from './lib/User.prisma';

const UsageLimits = {
  free: { api: 10, storage: 0 },
  premium: { api: 10_000, storage: 50 },
  pro: { api: 100_000, storage: 500 },
}

const server: FastifyInstance = Fastify({})
const env = process?.env?.ENV;

// Only use the instance once
const Prisma = new UserPrisma();


// Set Max Limits
server.register(fileUpload, {
  limits: { fileSize: 3 * 1024 * 1024 },
})

// Check user status
server.addHook('onRequest', async (request: any, reply, done) => {
  // For every endpoint except /signup require a token
  if (request.url !== '/signup') {
    const { token }: any = request?.headers;
    const user = await Prisma.getUser({ token });

    // Check that user token is valid
    if (token !== user?.token) {
      reply.code(400).send({
        message: 'Invalid token',
      });
    }

    // Do not check rate limit for /user endpoint
    if (request.url !== '/user') {
      console.log('user-usage: ', user?.usage?.apiUsage);
      console.log('user-api-usage-limit: ', UsageLimits[user?.membership!].api)
      // Check that user hasn't exceeded their usage limits
      if (user?.usage?.apiUsage === UsageLimits[user?.membership!].api) {
        reply.code(400).send({
          message: 'Reached API usage limit',
        });
      }
    }

    // Set the user
    request.headers.user = user;
  }

  done();
})

server.addHook('preValidation', (request, reply, done) => {
  logger.log({
    message: `Info - [${request?.url}] (${env})`,
    action: request?.url,
    body: request?.body,
    env,
  })
  done();
})

server.addHook('onError', (request, reply, error, done) => {
  logger.log({
    message: `Error - [${request?.url}] (${env})`,
    action: request?.url,
    body: request?.body,
    env,
  })
  done();
})

server.post('/signup', async (request, reply) => {
  const { email, contact }: any = request?.body;
  const isUser = await Prisma.getUser({ email });

  if (isUser?.id) {
    return reply.code(400).send({
      message: 'User already exists',
    });
  }

  const apiToken = uuidv4();
  const user = await Prisma.createUser({ email, token: apiToken, contact });

  return {
    id: user.id,
    email: user.email,
    contact: user.contactInfo,
    token: apiToken,
  }
});

server.get('/user', async (request, reply) => {
  const { token }: any = request?.headers;
  const user = await Prisma.getUser({ token });

  return {
    id: user?.id,
    email: user?.email,
    token: user?.token,
    contact: user?.contactInfo,
    usage: user?.usage,
  };
});

server.post('/resize', async (request: any, reply) => {
  const token = request?.headers?.token!;
  const user = request?.headers?.user;

  try {
    // For URL
    const { dimensions, outputFileName, url }: any = request?.body;
    // For FILE
    const name = (request?.body as any)?.file?.name;
    const data = (request?.body as any)?.file?.data;
    const fileDimensions = (request?.body as any)?.dimensions;

    // Update the quota for the user
    await Prisma.updateUsage(user?.email, user?.usage?.apiUsage + 1, UsageType.API);

    // For File
    if (name && data) {
      await writeFile(name, './media', data);
    }

    Resize({
      dimensions: dimensions || fileDimensions,
      inputFileName: name,
      outputFileName,
      url
    })

    return { file: await loadFile(outputFileName, 'output') };
  } catch (e) {
    return Error('Error resizing image');
  }
})

server.post('/thumbnail', async (request, reply) => {
  // For URL
  const { dimensions, outputFileName, url }: any = request?.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;
  const fileDimensions = (request?.body as any)?.dimensions;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Thumbnail({
    dimensions: dimensions || fileDimensions,
    inputFileName: name,
    outputFileName,
    url
  })

  return { file: await loadFile(outputFileName, 'output') };
})

server.post('/reduce', async (request, reply) => {
  // For URL
  const { percentage, url, outputFileName }: any = request.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;
  const filePercentage = (request?.body as any)?.percentage;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Reduce({
    inputFileName: name,
    outputFileName,
    percentage: percentage || filePercentage,
    url
  });

  return { file: await loadFile(outputFileName, 'output') };
})

server.post('/quality', async (request, reply) => {
  // For URL
  const { quality, outputFileName, url }: any = request?.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Quality({
    inputFileName: name,
    outputFileName,
    quality,
    url
  });

  return { file: await loadFile(outputFileName, 'output') };
});

server.post('/format', async (request, reply) => {
  // For URL
  const { format, outputFileName, url }: any = request?.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Format({
    inputFileName: name,
    outputFileName: format === '.png' ? outputFileName + '.png' : outputFileName + '.jpg',
    url
  });

  return { file: await loadFile(format === '.png' ? outputFileName + '.png' : outputFileName + '.jpg', 'output') };
});

(async () => {
  const PORT = 7777;
  // Create initial folder structure.
  await createFolders();
  server.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(
      `🚀 Encodex ready to convert your media needs on port ${PORT}!`
    );
  })
})();
