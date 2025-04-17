import { FastifyInstance } from 'fastify'

import { Prisma, SourceRecord } from '@prisma/client'

import { serializer } from './middleware/pre_serializer'
import { ApiError } from '../errors'
import {
  ApiErrorResponse,
  CreateSourceRecordDTO,
  ICreateSourceRecordDTO,
  IEntityId,
  SourceRecordSchema,
  VialSuccessResponse,
} from './schemas/common'
import { Type } from '@fastify/type-provider-typebox'
import { FormService } from '../service/form.service'
import { SourceRecordService } from '../service/source_record.service'

async function sourceRecordRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'sourceRecordRoutes' })

  const formService = new FormService()
  const sourceRecordService = new SourceRecordService()

  app.get<{
    Reply: SourceRecord[]
  }>('/', {
    schema: {
      description: 'Route responsible for fetching all source records.',
      tags: ['source-record'],
      response: {
        200: Type.Array(SourceRecordSchema),
        400: ApiErrorResponse,
      },
    },
    async handler(_, reply) {
      try {
        const sourceRecord = await sourceRecordService.findAll()

        reply.send(sourceRecord)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to fetch source record', 400)
      }
    },
  })

  app.post<{
    Body: ICreateSourceRecordDTO
  }>('/', {
    schema: {
      description: 'Route responsible for saving a new source record.',
      tags: ['source-record'],
      body: CreateSourceRecordDTO,
      response: {
        201: VialSuccessResponse,
        404: ApiErrorResponse,
        500: ApiErrorResponse,
      },
    },
    async handler(req, reply) {
      const body = req.body

      try {
        await formService.findByIdOrThrow(body.formId)
        await sourceRecordService.createSourceRecord(body)
        reply.status(201)
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          log.error({ err }, err.message)

          if (err.code === 'P2025') {
            throw new ApiError('Source record not found.', 404)
          }

          throw new ApiError('Unexpected error while saving data.', 500)
        }
      }
    },
  })
}

export default sourceRecordRoutes
