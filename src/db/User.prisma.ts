import * as Sentry from '@sentry/node';
const { PrismaClient } = require('@prisma/client');

enum MEMBERSHIP {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium'
}

interface User {
  id: number;
  email: string;
  token: string;
  membership?: MEMBERSHIP;
  usage: {
    id?: number;
    userId?: number;
    apiUsage?: number;
    storageUsage?: number;
    subscriptionDate?: Date;
  }
}

export enum UsageType {
  API = 'API',
  STORAGE = 'STORAGE'
}

export default class UserPrisma {
  public ps: any;

  constructor() {
    this.ps = new PrismaClient();
  }

  public async createUser(data: any): Promise<User | null> {
    try {
      const { email, token } = data;
      const user = await this.ps.User.create({
        data: {
          email,
          token,
          membership: MEMBERSHIP.FREE
        },
      });

      const usage = await this.ps.Usage.create({
        data: {
          userId: user?.id,
          apiUsage: 0,
          storageUsage: 0,
          signupDate: new Date(),
          subscriptionDate: new Date()
        }
      })

      return {
        id: user.id,
        email: user.email,
        token: user.token,
        usage
      };
    } catch (e) {
      console.log(e);
      Sentry.captureException(e);
      Sentry.captureMessage('[User.prisma.ts](createUser)', 'error');
      return null;
    }
  }

  public async getUser({ email, token }: { email?: string, token?: string }): Promise<User | null> {
    try {
      const user = await this.ps.User.findUnique({
        where: email ? {
          email,
        } : { token },
      });

      if (user) {
        const usage = await this.ps.Usage.findUnique({
          where: {
            userId: user.id,
          },
        });

        return {
          id: user.id,
          email: user.email,
          token: user.token,
          membership: user.membership,
          usage
        };
      }
      return null;
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[User.prisma.ts](getUser)', 'error');
      return null;
    }
  }

  public async getAllUsers(): Promise<User[] | null> {
    try {
      const users = await this.ps.User.findMany();

      if (users) {
        return users;
      }
      return null;
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[User.prisma.ts](getAllUsers)', 'error');
      return null;
    }
  }

  public async updateUsage({ email, id, usage, type, date }: { email?: string, id?: number, usage: number, type: UsageType, date: Date }): Promise<any> {
    const user = await this.ps.User.findUnique({
      where: id ? { id } : {
        email,
      },
    });

    if (user) {
      const updatedUsage = await this.ps.Usage.update({
        where: {
          userId: user.id,
        },
        data: type === "API" ? {
          apiUsage: usage,
          lastSyncDate: date
        } : { storageUsage: usage, lastSyncDate: date },
      });

      return updatedUsage;
    }

    return null;
  }

  public async getAllUsages(): Promise<any> {
    try {
      const usages = await this.ps.Usage.findMany();
      return usages;
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[User.prisma.ts](getAllUsages)', 'error');
      return null;
    }
  }
}