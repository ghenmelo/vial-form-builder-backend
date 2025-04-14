import { FastifyInstance } from 'fastify'

import { Form } from '@prisma/client'

import prisma from '../db/db_client'
import { serializer } from './middleware/pre_serializer'
import {
  ApiErrorResponse,
  CreateFormDTO,
  EntityId,
  FormSchema,
  ICreateFormDTO,
  IEntityId,
  VialSuccessResponse,
} from './schemas/common'
import { ApiError } from '../errors'
import { Type } from '@sinclair/typebox'

async function formRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'formRoutes' })

  app.get<{
    Params: IEntityId
    Reply: Form
  }>('/:id', {
    schema: {
      description: 'Search for form',
      tags: ['form'],
      params: EntityId,
      response: {
        200: FormSchema,
        400: ApiErrorResponse,
      },
    },
    async handler(req, reply) {
      const { params } = req
      const { id } = params

      try {
        const form = await prisma.form.findUniqueOrThrow({ where: { id } })
        reply.send(form)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to fetch form', 400)
      }
    },
  })

  app.get<{
    Reply: Form[]
  }>('/', {
    schema: {
      description: 'Get all forms',
      tags: ['form'],
      response: {
        200: Type.Array(FormSchema),
        400: ApiErrorResponse,
      },
    },
    async handler(_, reply) {
      try {
        const form = await prisma.form.findMany()
        reply.send(form)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to fetch forms', 400)
      }
    },
  })

  app.post<{
    Body: ICreateFormDTO
  }>('/', {
    schema: {
      description: 'Insert new form',
      tags: ['form'],
      body: CreateFormDTO,
      response: {
        200: CreateFormDTO,
        400: ApiErrorResponse,
      },
    },
    async handler(req, reply) {
      const { name, fields } = req.body

      console.log(fields)
      const form = await prisma.form
        .create({
          data: {
            name: name,
            fields: JSON.parse(fields),
          },
        })
        .catch(err => {
          log.error({ err }, err.message)
          throw new ApiError('Failed to save form', 400)
        })

      reply.send(form)
    },
  })

  app.delete<{
    Params: IEntityId
  }>('/:id', {
    schema: {
      description: 'Delete form',
      tags: ['form'],
      params: EntityId,
      response: {
        204: VialSuccessResponse,
        404: ApiErrorResponse,
        500: ApiErrorResponse,
      },
    },
    async handler(req, reply) {
      const { params } = req
      const { id } = params

      const form = await prisma.form
        .findFirstOrThrow({
          where: {
            id: id,
          },
        })
        .catch(err => {
          log.error({ err }, err.message)
          throw new ApiError('Form not found', 404)
        })

      try {
        await prisma.$transaction(async transaction => {
          await transaction.sourceData.deleteMany({
            where: {
              sourceRecord: {
                formId: form.id,
              },
            },
          })

          await transaction.sourceRecord.deleteMany({
            where: {
              formId: form.id,
            },
          })

          await transaction.form.delete({
            where: {
              id: form.id,
            },
          })
        })
        reply.status(204)
      } catch (err) {
        log.error({ err }, err.message)
        throw new ApiError('Unexpected error while deleting data.', 500)
      }
    },
  })
}

export default formRoutes
