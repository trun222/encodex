import Fastify, { FastifyInstance } from 'fastify'
import { Resize, Reduce, Quality, Quality2 } from './util/commands';
import { loadFile, writeFile, createFolders } from './util/files';
import fileUpload from 'fastify-file-upload';

const server: FastifyInstance = Fastify({})

server.register(fileUpload, {
  limits: { fileSize: 3 * 1024 * 1024 },
})

// server.post('/resize', async (request, reply) => {
//   const { dimensions, inputFileName, outputFileName }: any = request.body;
//   Resize({
//     dimensions,
//     inputFileName,
//     outputFileName
//   })
//   // Return a payload 
//   return { file: await loadFile(`./output/${outputFileName}`) };
// })

// server.post('/reduce', async (request, reply) => {
//   const { percentage, inputFileName, outputFileName }: any = request.body;
//   // Perform the conversion and upload it to S3 or Wasabi
//   Reduce({
//     inputFileName,
//     outputFileName,
//     percentage,
//   });
//   return { file: await loadFile(`./output/${outputFileName}`) };
// })

server.post('/quality', async (request, reply) => {
  const { quality, outputFileName }: any = request.body;
  const { name, data } = (request.body as any).file;
  await writeFile(name, './media', data);
  // Perform the conversion and upload it to S3 or Wasabi
  Quality({
    inputFileName: name,
    outputFileName,
    quality,
  });
  return { file: await loadFile(outputFileName, 'output') };
});

server.post('/quality2', async (request, reply) => {
  const { quality, inputFileName, outputFileName }: any = request.body;
  // Perform the conversion and upload it to S3 or Wasabi
  Quality2({
    inputFileName,
    outputFileName,
    quality,
  });
  return { file: await loadFile(outputFileName, 'output') };
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
