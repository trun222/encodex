import * as Sentry from '@sentry/node';

export default async function GET(server, Prisma) {
  server.get('/user', async (request, reply) => {
    try {
      const { token }: any = request?.headers;
      const user = await Prisma.getUser({ token });

      return {
        id: user?.id,
        email: user?.email,
        token: user?.token,
        contact: user?.contactInfo,
        usage: user?.usage,
      };
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[GET](/user)', 'error');
      return e;
    }
  });
}