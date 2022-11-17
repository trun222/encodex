import * as Sentry from '@sentry/node';
const { PrismaClient } = require('@prisma/client');
import { Hosted, HostedEnum } from '@/src/interfaces/Cloud.interface';
import * as crypto from '@/src/util/crypto';

interface CloudConnection {
  id: number;
  userId: number;
  provider: Hosted;
  bucket?: string;
  region?: string;
  accessKeyIV?: string;
  accessKey?: string;
  secretKey?: string;
  secretKeyIV?: string;
  accountName?: string;
  accountAccessKey?: string;
  accountAccessKeyIV?: string;
  clientEmail?: string;
  privateKey?: string;
  privateKeyIV?: string;
}

export default class CloudConnectionPrisma {
  public ps: any;

  constructor() {
    this.ps = new PrismaClient();
  }

  public async createConnectionAWS({ userId, provider, bucket, region, accessKey, secretKey }: CloudConnection): Promise<Omit<CloudConnection, "id"> | null> {
    try {
      const encryptedAccess = crypto.encrypt(accessKey!);
      const encryptedSecret = crypto.encrypt(secretKey!);

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
      Sentry.captureMessage('[CloudConnection.prisma.ts](createConnectionAWS)', 'error');
      return null;
    }
  }

  public async createConnectionAzure({ userId, provider, accountName, accountAccessKey }: CloudConnection): Promise<Omit<CloudConnection, "id"> | null> {
    try {
      const encryptedAccessKey = crypto.encrypt(accountAccessKey!);

      const connection = await this.ps.CloudConnections.create({
        data: {
          userId,
          provider,
          accountName,
          accountAccessKey: encryptedAccessKey.content,
          accountAccessKeyIV: encryptedAccessKey.iv
        },
      });

      return connection
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[CloudConnection.prisma.ts](createConnectionAzure)', 'error');
      return null;
    }
  }

  public async createConnectionGCP({ userId, provider, bucket, clientEmail, privateKey }: CloudConnection): Promise<Omit<CloudConnection, "id"> | null> {
    try {
      const encryptedPrivateKey = crypto.encrypt(privateKey!);

      const connection = await this.ps.CloudConnections.create({
        data: {
          userId,
          provider,
          bucket,
          clientEmail,
          privateKey: encryptedPrivateKey.content,
          privateKeyIV: encryptedPrivateKey.iv
        },
      });

      return connection
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[CloudConnection.prisma.ts](createConnectionGCP)', 'error');
      return null;
    }
  }

  public async getConnection({ connectionId }: { connectionId: number }): Promise<Omit<CloudConnection, "accessKeyIV" | "secretKeyIV" | "accountAccessKeyIV"> | null> {
    try {
      const connection: CloudConnection = await this.ps.CloudConnections.findUnique({
        where: {
          id: connectionId
        }
      });

      if (connection?.provider === HostedEnum.AWS) {
        return {
          id: connection?.id,
          userId: connection?.userId,
          provider: connection?.provider,
          bucket: connection?.bucket,
          region: connection?.region,
          accessKey: crypto.decrypt({ iv: connection?.accessKeyIV!, content: connection?.accessKey! }),
          secretKey: crypto.decrypt({ iv: connection?.secretKeyIV!, content: connection?.secretKey! })
        };
      } else if (connection?.provider === HostedEnum.AZURE) {
        return {
          id: connection?.id,
          userId: connection?.userId,
          provider: connection?.provider,
          accountName: connection?.accountName,
          accountAccessKey: crypto.decrypt({ iv: connection?.accountAccessKeyIV!, content: connection?.accountAccessKey! })
        };
      } else if (connection?.provider === HostedEnum.GCP) {
        return {
          id: connection?.id,
          userId: connection?.userId,
          provider: connection?.provider,
          bucket: connection?.bucket,
          clientEmail: connection?.clientEmail,
          privateKey: crypto.decrypt({ iv: connection?.privateKeyIV!, content: connection?.privateKey! })
        }
      }

      throw new Error('No connections found');
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[CloudConnection.prisma.ts](getConnection)', 'error');
      return null;
    }
  }

  public async deleteConnection({ connectionId }: { connectionId: number }): Promise<{ id: number } | null> {
    try {
      const connection: CloudConnection = await this.ps.CloudConnections.delete({
        where: {
          id: connectionId
        }
      });

      return {
        id: connection?.id,
      };
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[CloudConnection.prisma.ts](deleteConnection)', 'error');
      return null;
    }
  }
}