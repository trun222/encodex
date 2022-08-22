import Fastify, { FastifyInstance } from 'fastify'
import { createFolders } from '@/src/util/files';
import fileUpload from 'fastify-file-upload';
import UserPrisma from '@/src/lib/User.prisma';
import { logger } from '@/src/util/logging';
import { UsageLimits } from '@/src/util/usage';

const env = process?.env?.ENV;

const server: FastifyInstance = Fastify({});
const Prisma = new UserPrisma();

(async function app() {
  const PORT = 7777;
  // Create initial folder structure.
  await createFolders();

  server.register(fileUpload, {
    limits: { fileSize: 100 * 1024 * 1024 },
  });

  // LifeCycles
  server.addHook('onRequest', async (request: any, reply, done) => {
    // For every endpoint except /signup require a token
    if (request.url !== '/signup') {
      const { token }: any = request?.headers;

      if (token) {
        const user = await Prisma.getUser({ token });

        // Check that user token is valid
        if (token !== user?.token) {
          reply.code(400).send({
            message: 'Invalid token',
          });
        }

        // Do not check rate limit for /user endpoint
        if (request.url !== '/user') {
          // Check that user hasn't exceeded their usage limits
          if (user?.usage?.apiUsage === UsageLimits[user?.membership!].api) {
            reply.code(400).send({
              message: 'Reached API usage limit',
            });
          }
        }
        // Set the user
        request.headers.user = user;
        done();

      } else {
        reply.code(400).send({
          message: 'Missing token',
        });
      }
    }
  })

  server.addHook('preValidation', (request, reply, done) => {
    let temp = {};

    // If the request is a file upload
    if ((request?.body as any)?.file) {
      Object.keys((request?.body as any)).filter((key: string) => key !== 'file').forEach(key => {
        temp[key] = (request?.body as any)[key];
      })

      // Handle File size limits based on membership
      const fileSize = (request?.body as any)?.file?.size;
      const membership = (request?.headers.user as any)?.membership;

      if (fileSize > UsageLimits[membership].maxFileSize) {
        reply.code(400).send({
          message: 'File size exceeds maximum allowed',
        });
      }
    }

    logger.log({
      message: `Info - [${request?.url}] (${env})`,
      action: request?.url,
      body: (request?.body as any)?.file ? temp : request.body,
      env,
    })
    done();
  })

  server.addHook('onError', (request, reply, error, done) => {
    let temp = {};

    if ((request?.body as any)?.file) {
      Object.keys(request.body).filter((key: string) => key !== 'file').forEach(key => {
        temp[key] = request.body[key];
      })
    }

    logger.log({
      message: `Error - [${request?.url}] (${env})`,
      action: request?.url,
      body: (request?.body as any)?.file ? temp : request.body,
      env,
    })
    done();
  })

  // Posts
  server.register(require('@/src/routes/POST'), Prisma);
  // GETS
  server.register(require('@/src/routes/GET'), Prisma);


  server.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(
      `🚀 Encodex ready to convert your media needs on port ${PORT}!`
    );
  })
})();
