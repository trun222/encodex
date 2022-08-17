import UserPrisma, { UsageType } from '@/src/lib/User.prisma';
import { logger } from '@/src/util/logging';
import { UsageLimits } from '@/src/util/usage';

const env = process?.env?.ENV;

export default (server) => {
  // Only use the instance once
  const Prisma = new UserPrisma();

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
    if ((request?.body as any)?.file) {
      Object.keys(request.body).filter((key: string) => key !== 'file').forEach(key => {
        temp[key] = request.body[key];
      })
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


  server.addHook('onResponse', async (request, reply, done) => {
    if (request.url !== '/user' && request.url !== '/signup') {
      const user = request?.headers?.user as any;
      // Update the quota for the user
      await Prisma.updateUsage(user?.email, user?.usage?.apiUsage + 1, UsageType.API);
      done();
    }
  })
}