import * as Sentry from '@sentry/node';
import { v4 as uuidv4 } from 'uuid';
const jwt = require("node-jsonwebtoken");
import CloudConnectionPrisma from '@/src/db/CloudConnection.prisma';
import { UpdateUsage } from '@/src/util/usage';
import { GetAndDeleteCloudConnectionSchema } from '@/src/validation/request.schema';

// TODO: Fix inconsistent returning of exceptions throughout the code
// TODO: Add schema validation

const cloudConnectionPrisma: any = new CloudConnectionPrisma();

export default async function GET(server, Prisma) {
  server.get('/user', async (request, reply) => {
    try {
      const { token }: any = request?.headers;
      const user = await Prisma.getUser({ token });

      return {
        id: user?.id,
        email: user?.email,
        token: user?.token,
        usage: user?.usage,
      };
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[GET](/user)', 'error');
      return e;
    }
  });

  server.get('/cloudConnection/:connectionId', GetAndDeleteCloudConnectionSchema, async (request, reply) => {
    try {
      const connectionId = (request.params as any)?.connectionId;
      const user = request.headers.user;
      const connection = await cloudConnectionPrisma.getConnection({
        connectionId: parseInt(connectionId, 10)
      });

      // Ensure someone doesn't try to fetch someone else's cloud connection
      if (user.id !== connection.userId) {
        return {
          message: `This connection is not associated with this user.`
        };
      }

      return await UpdateUsage(request, Prisma,
        connection
      );
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[GET](/cloudConnection)', 'error');
      return {
        message: 'Failed to retrieve cloud connection'
      };
    }
  });

  server.get('/scalorUser', async (request, reply) => {
    try {
      const { accesstoken }: any = request?.headers;
      const decoded = jwt.decode(accesstoken, process?.env?.JWT_PUBLIC_KEY);
      const user = await Prisma.getUser({ email: decoded?.user?.email });

      if (!user) {
        // create user and return new user info
        const created = await Prisma.createUser({
          email: decoded?.user?.email,
          token: uuidv4()
        })

        return {
          id: created?.id,
          email: created?.email,
          token: created?.token,
          usage: created?.usage
        }
      }

      return {
        id: user?.id,
        email: user?.email,
        token: user?.token,
        usage: user?.usage,
      };
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[GET](/scalorUser)', 'error');
      return e;
    }
  });
}