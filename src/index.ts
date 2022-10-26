import Fastify, { FastifyInstance } from 'fastify'
import { createFolders } from '@/src/util/files';
import fileUpload from 'fastify-file-upload';
import UserPrisma from '@/src/db/User.prisma';
import { onRequest, preValidation, onError } from '@/src/util/hooks';
import * as Sentry from '@sentry/node';
import "@sentry/tracing";
import cors from '@fastify/cors'
import rawbody from "fastify-raw-body";

Sentry.init({
  release: 'scalor-services@0.0.1',
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.ENV,
});

const server: FastifyInstance = Fastify({});
const Prisma = new UserPrisma();

(async function app() {
  const PORT = 7777;
  // Create initial folder structure.
  await createFolders();

  // File size limits
  server.register(fileUpload, {
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB size limit
  });

  // Raw Body Requests for Stripe
  server.register(rawbody, {
    field: "rawBody", // change the default request.rawBody property name
    global: false, // add the rawBody to every request. **Default true**
    encoding: "utf8", // set it to false to set rawBody as a Buffer **Default utf8**
    runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
    routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
  });

  // CORS
  await server.register(cors, {
    origin: '*'
  })

  // Rate limit based on IP
  server.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute'
  })

  // LifeCycles
  server.addHook('onRequest', onRequest);
  server.addHook('preValidation', preValidation)
  server.addHook('onError', onError)

  // Posts
  server.register(require('@/src/routes/POST'), Prisma);
  // GETS
  server.register(require('@/src/routes/GET'), Prisma);
  // Stripe
  server.register(require('@/src/routes/Stripe'));


  server.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(
      `🚀 Encodex ready to convert your media needs on port ${PORT}!`
    );
  })
})();
