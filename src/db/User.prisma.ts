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

  public async createUser(data: any): Promise<User> {
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
  }

  public async getUser({ email, token }: { email?: string, token?: string }): Promise<User | null> {
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
  }

  public async updateUsage(email: string, usage: number, type: UsageType): Promise<any> {
    const user = await this.ps.User.findUnique({
      where: {
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
        } : { storageUsage: usage },
      });

      return updatedUsage;
    }

    return null;
  }
}