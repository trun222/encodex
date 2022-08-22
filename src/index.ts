import Fastify, { FastifyInstance } from 'fastify'
import { createFolders } from '@/src/util/files';
import fileUpload from 'fastify-file-upload';
import UserPrisma from '@/src/lib/User.prisma';

const server: FastifyInstance = Fastify({});
const Prisma = new UserPrisma();

(async function app() {
  const PORT = 7777;
  // Create initial folder structure.
  await createFolders();

  server.register(fileUpload, {
    limits: { fileSize: 100 * 1024 * 1024 },
  });

  // LifeCycles
  server.register(require('@/src/util/hooks'), Prisma);
  // Posts
  server.register(require('@/src/routes/POST'), Prisma);
  // GETS
  server.register(require('@/src/routes/GET'), Prisma);


  server.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(
      `🚀 Encodex ready to convert your media needs on port ${PORT}!`
    );
  })
})();
