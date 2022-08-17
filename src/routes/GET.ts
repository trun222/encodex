import UserPrisma from '@/src/lib/User.prisma';

export default (server, Prisma) => {
  server.get('/user', async (request, reply) => {
    const { token }: any = request?.headers;
    const user = await Prisma.getUser({ token });

    return {
      id: user?.id,
      email: user?.email,
      token: user?.token,
      contact: user?.contactInfo,
      usage: user?.usage,
    };
  });
}