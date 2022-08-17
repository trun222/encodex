import Fastify, { FastifyInstance } from 'fastify'
import { createFolders } from '@/src/util/files';
import fileUpload from 'fastify-file-upload';
import Hooks from '@/src/util/hooks';
import GET from '@/src/routes/GET';
import POST from '@/src/routes/POST';

const server: FastifyInstance = Fastify({});

((async () => {
  // Set Max Limits
  server.register(fileUpload, {
    limits: { fileSize: 100 * 1024 * 1024 },
  })

  // Lifecycle hooks
  Hooks(server);
  // All Get Routes
  GET(server);
  // All Post Routes
  POST(server);
}
))();

(async () => {
  const PORT = 7777;
  // Create initial folder structure.
  await createFolders();
  server.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(
      `🚀 Encodex ready to convert your media needs on port ${PORT}!`
    );
  })
})();
