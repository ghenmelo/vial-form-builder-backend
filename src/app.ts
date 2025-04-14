import fastify from 'fastify'

import formRoutes from './routes/form'
import errorHandler from './errors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import sourceRecordRoutes from './routes/source_record'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import addFormats from 'ajv-formats'
import Ajv from 'ajv'
import ajvFormats from './routes/schemas/ajv_formats'

function build(opts = {}) {
  const app = fastify(opts)
    .setValidatorCompiler(({ schema }) => {
      const ajv = new Ajv({ coerceTypes: true, allErrors: true })

      addFormats(ajvFormats(ajv))
      return ajv.compile(schema)
    })
    .withTypeProvider<TypeBoxTypeProvider>()

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Form Builder Api  ',
        description: 'Form builder api',
        version: '0.1.0',
      },
    },
  })

  app.register(sourceRecordRoutes, { prefix: '/source' })

  app.register(formRoutes, { prefix: '/form' })

  app.register(fastifySwaggerUi, {
    routePrefix: '/api',
  })

  app.setErrorHandler(errorHandler)

  return app
}
export default build
