import Fastify, { FastifyInstance } from 'fastify'
import { Resize, Reduce, Quality, Thumbnail, Format } from './util/commands';
import { loadFile, writeFile, createFolders } from './util/files';
import fileUpload from 'fastify-file-upload';

const server: FastifyInstance = Fastify({})

// Set Max Limits
server.register(fileUpload, {
  limits: { fileSize: 3 * 1024 * 1024 },
})

// server.addHook('onRequest', (request, reply, done) => {
//   console.log({ request });
//   console.log(request?.raw.rawHeaders)
//   done();
// })

server.post('/resize', async (request, reply) => {
  // For URL
  const { dimensions, outputFileName, url }: any = request?.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;
  const fileDimensions = (request?.body as any)?.dimensions;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Resize({
    dimensions: dimensions || fileDimensions,
    inputFileName: name,
    outputFileName,
    url
  })

  return { file: await loadFile(outputFileName, 'output') };
})

server.post('/thumbnail', async (request, reply) => {
  // For URL
  const { dimensions, outputFileName, url }: any = request?.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;
  const fileDimensions = (request?.body as any)?.dimensions;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Thumbnail({
    dimensions: dimensions || fileDimensions,
    inputFileName: name,
    outputFileName,
    url
  })

  return { file: await loadFile(outputFileName, 'output') };
})

server.post('/reduce', async (request, reply) => {
  // For URL
  const { percentage, url, outputFileName }: any = request.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;
  const filePercentage = (request?.body as any)?.percentage;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Reduce({
    inputFileName: name,
    outputFileName,
    percentage: percentage || filePercentage,
    url
  });

  return { file: await loadFile(outputFileName, 'output') };
})

server.post('/quality', async (request, reply) => {
  // For URL
  const { quality, outputFileName, url }: any = request?.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Quality({
    inputFileName: name,
    outputFileName,
    quality,
    url
  });

  return { file: await loadFile(outputFileName, 'output') };
});

server.post('/format', async (request, reply) => {
  // For URL
  const { format, outputFileName, url }: any = request?.body;
  // For FILE
  const name = (request?.body as any)?.file?.name;
  const data = (request?.body as any)?.file?.data;

  // For File
  if (name && data) {
    await writeFile(name, './media', data);
  }

  Format({
    inputFileName: name,
    outputFileName: format === '.png' ? outputFileName + '.png' : outputFileName + '.jpg',
    url
  });

  return { file: await loadFile(format === '.png' ? outputFileName + '.png' : outputFileName + '.jpg', 'output') };
});

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
