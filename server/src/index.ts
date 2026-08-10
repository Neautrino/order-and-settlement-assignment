import Fastify from "fastify";

const PORT = 3000

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  return {
    success: true,
    message: 'Order and settlements server is running'
  }
})

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})