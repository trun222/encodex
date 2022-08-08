import Fastify, { FastifyInstance } from 'fastify'
import { Resize, Reduce, Quality } from './util/commands';
import { loadFile, writeFile } from './util/files';
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
})

const start = async () => {
  try {
    await server.listen({ port: 7777 })

    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port
    console.log(`Encodex ready to conver your media need on port ${port}!`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()