const { PrismaClient } = require('@prisma/client');


interface StripeSession {
  id: string;
  email: string;
  paymentStatus: string;
  created: Date
  expires: Date
}

export default class StripePrisma {
  public ps: any;

  constructor() {
    this.ps = new PrismaClient();
  }

  public async createSession(data: any): Promise<StripeSession | undefined> {
    try {
      const { id, email, paymentStatus, created, expires } = data;
      const session = await this.ps.StripeSession.create({
        data: {
          id,
          email,
          paymentStatus,
          created,
          expires
        },
      });

      console.log('creating session...', session);

      return session;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  public async getSession({ email }): Promise<StripeSession | null> {
    try {
      const session = await this.ps.StripeSession.findMany({
        where: {
          email,
        },
        orderBy: {
          dateTime: 'desc',
        },
        take: 1
      });

      if (!session) {
        return null;
      }

      return session;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}