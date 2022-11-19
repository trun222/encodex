const fastify = require('fastify');
const addons = require('../index');
const tap = require('tap');

function build(opts: any = {}) {
  const app: any = fastify(opts)
  app.get('/', async function (request: any, reply: any) {
    return { hello: 'world' }
  })

  return app
}


tap.test('GET `/` route', (t: any) => {
  t.plan(4)

  const fastify: any = build();

  // At the end of your tests it is highly recommended to call `.close()`
  // to ensure that all connections to external services get closed.
  t.teardown(() => fastify.close())

  fastify.inject({
    method: 'GET',
    headers: {
      token: 'sdfsdfsd'
    },
    url: '/user'
  }, (err: any, response: any) => {
    console.log(response);
    t.error(err)
    t.equal(response.statusCode, 200)
    t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
    t.same(response.json(), { hello: 'world' })
  })
})