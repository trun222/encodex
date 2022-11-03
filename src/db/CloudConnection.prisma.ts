import * as Sentry from '@sentry/node';
const { PrismaClient } = require('@prisma/client');
import { Hosted } from '@/src/interfaces/Cloud.interface';
import * as crypto from '@/src/util/crypto';

interface CloudConnection {
  id: number;
  userId: number;
  provider: Hosted;
  bucket: string;
  region: string;
  accessKeyIV?: string;
  accessKey: string;
  secretKey: string;
  secretKeyIV?: string;
}

export default class CloudConnectionPrisma {
  public ps: any;

  constructor() {
    this.ps = new PrismaClient();
  }

  public async createConnection({ userId, provider, bucket, region, accessKey, secretKey }: CloudConnection): Promise<Omit<CloudConnection, "id"> | null> {
    try {
      const encryptedAccess = crypto.encrypt(accessKey);
      const encryptedSecret = crypto.encrypt(secretKey);

      const connection = await this.ps.CloudConnections.create({
        data: {
          userId,
          provider,
          bucket,
          region,
          accessKey: encryptedAccess.content,
          accessKeyIV: encryptedAccess.iv,
          secretKey: encryptedSecret.content,
          secretKeyIV: encryptedSecret.iv
        },
      });

      return connection
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[CloudConnection.prisma.ts](createUser)', 'error');
      return null;
    }
  }

  public async getConnection({ connectionId }: { connectionId: number }): Promise<Omit<CloudConnection, "accessKeyIV" | "secretKeyIV"> | null> {
    try {
      const connection: CloudConnection = await this.ps.CloudConnections.findUnique({
        where: {
          id: connectionId
        }
      });

      return {
        id: connection?.id,
        userId: connection?.userId,
        provider: connection?.provider,
        bucket: connection?.bucket,
        region: connection?.region,
        accessKey: crypto.decrypt({ iv: connection?.accessKeyIV!, content: connection?.accessKey }),
        secretKey: crypto.decrypt({ iv: connection?.secretKeyIV!, content: connection?.secretKey })
      };
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[CloudConnection.prisma.ts](getConnection)', 'error');
      return null;
    }
  }
}