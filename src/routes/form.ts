import { FastifyInstance } from 'fastify'

import { Form, Prisma, SourceRecord } from '@prisma/client'

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
import { FormService } from '../service/form.service'

async function formRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'formRoutes' })

  const service = new FormService()

  app.get<{
    Params: IEntityId
    Reply: Form
  }>('/:id', {
    schema: {
      description: 'Route responsible for fetching a form by its ID.',
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
        const form = await service.findByIdOrThrow(id)
        reply.send(form)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to fetch form', 400)
      }
    },
  })

  app.get<{
    Params: IEntityId
    Reply: SourceRecord[]
  }>('/source/:id', {
    schema: {
      description:
        'Route responsible for returning the source records of a form, based on the form ID.',
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
        const sourceRecords = await service.findFormSourceRecordById(id)
        reply.send(sourceRecords)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to sources from form', 400)
      }
    },
  })

  app.get<{
    Reply: Form[]
  }>('/', {
    schema: {
      description: 'Route responsible for fetching all forms.',
      tags: ['form'],
      response: {
        200: Type.Array(FormSchema),
        400: ApiErrorResponse,
      },
    },
    async handler(_, reply) {
      try {
        const form = await service.findAll()
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
      description: 'Route responsible for saving a new form.',
      tags: ['form'],
      body: CreateFormDTO,
      response: {
        200: CreateFormDTO,
        400: ApiErrorResponse,
      },
    },
    async handler(req, reply) {
      const { name } = req.body
      const existingForm = await service.findByName(name)

      if (existingForm) {
        throw new ApiError('A form with this name already exists.', 409)
      }

      try {
        const form = await service.createForm(req.body)
        reply.send(form)
      } catch (err) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to save form', 400)
      }
    },
  })

  app.delete<{
    Params: IEntityId
  }>('/:id', {
    schema: {
      description: 'Route responsible for deleting a form.',
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

      try {
        await service.findByIdOrThrow(id)
        await service.deleteForm(id)
        reply.status(204)
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          log.error({ err }, err.message)

          if (err.code === 'P2025') {
            throw new ApiError('Form not found.', 404)
          }

          throw new ApiError('Unexpected error while deleting data.', 500)
        }
      }
    },
  })
}

export default formRoutes
