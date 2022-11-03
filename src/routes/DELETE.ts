import * as Sentry from '@sentry/node';
import CloudConnectionPrisma from '@/src/db/CloudConnection.prisma';
import { UpdateUsage } from '@/src/util/usage';
import { GetAndDeleteCloudConnectionSchema } from '@/src/validation/request.schema';

const cloudConnectionPrisma: any = new CloudConnectionPrisma();

export default async function DELETE(server, Prisma) {
  server.delete('/cloudConnection/:connectionId', GetAndDeleteCloudConnectionSchema, async (request, reply) => {
    try {
      const connectionId: number = parseInt(request?.params.connectionId, 10);
      const user = request.headers.user;

      const connection = await cloudConnectionPrisma.getConnection({
        connectionId
      });

      // Ensure someone doesn't try to fetch someone else's cloud connection
      if (user.id !== connection?.userId) {
        return {
          message: `This connection is not associated with this user.`
        };
      }

      await cloudConnectionPrisma.deleteConnection({ connectionId });

      return await UpdateUsage(request, Prisma, {
        id: connection?.id
      });
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[DELETE](/deleteConnection)', 'error');
      return {
        message: 'Failed to delete cloud connection'
      };
    }
  });
};