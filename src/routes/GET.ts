import UserPrisma from '@/src/lib/User.prisma';

export default (server) => {
  // Only use the instance once
  const Prisma = new UserPrisma();

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