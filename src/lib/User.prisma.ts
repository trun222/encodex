const { PrismaClient } = require('@prisma/client');

interface User {
  id: number;
  email: string;
  token: string;
  membership?: 'free' | 'pro' | 'premium';
  contactInfo: {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  },
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
    const { email, token, contact } = data;
    const user = await this.ps.User.create({
      data: {
        email,
        token,
      },
    });
    const contactInfo = await this.ps.ContactInfo.create({
      data: {
        userId: user.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zip: contact.zip,
      },
    });

    return {
      id: user.id,
      email: user.email,
      token: user.token,
      contactInfo,
      usage: {
        apiUsage: 0,
        storageUsage: 0,
      }
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

      const contactInfo = await this.ps.ContactInfo.findUnique({
        where: {
          userId: user?.id,
        },
      });

      return {
        id: user.id,
        email: user.email,
        token: user.token,
        membership: user.membership,
        contactInfo,
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