import { UsageLimits } from '@/src/util/usage';
import UserPrisma from '@/src/lib/User.prisma';
import { logger } from '@/src/util/logging';

const env = process?.env?.ENV;

const Prisma = new UserPrisma();

export const onRequest = async (request: any, reply, done) => {
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
}

export const preValidation = async (request: any, reply, done) => {
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
}

export const onError = async (request: any, reply, done) => {
  let temp = {};

  if ((request?.body as any)?.file) {
    Object.keys((request?.body as any)).filter((key: string) => key !== 'file').forEach(key => {
      temp[key] = (request?.body as any)[key];
    })
  }

  logger.log({
    message: `Error - [${request?.url}] (${env})`,
    action: request?.url,
    body: (request?.body as any)?.file ? temp : request.body,
    env,
  })
  done();
}