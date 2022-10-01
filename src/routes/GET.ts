import * as Sentry from '@sentry/node';
import { v4 as uuidv4 } from 'uuid';
const jwt = require("node-jsonwebtoken");

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