import { FastifyInstance } from 'fastify'

import { SourceRecord } from '@prisma/client'

import prisma from '../db/db_client'
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

async function sourceRecordRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'sourceRecordRoutes' })

  app.get<{
    Reply: SourceRecord[]
  }>('/', {
    schema: {
      tags: ['source-record'],
      response: {
        200: Type.Array(SourceRecordSchema),
        400: ApiErrorResponse,
      },
    },
    async handler(_, reply) {
      try {
        const sourceRecord = await prisma.sourceRecord.findMany({
          include: {
            sourceData: true,
          },
        })

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

      const form = await prisma.form
        .findFirstOrThrow({
          where: {
            id: body.formId,
          },
        })
        .catch(err => {
          log.error({ err }, err.message)
          throw new ApiError('Form not found', 404)
        })

      await prisma
        .$transaction(async transaction => {
          const sourceRecord = await transaction.sourceRecord.create({
            data: {
              formId: form.id,
            },
          })

          const sourceDatas = body.sourceData.map(({ answer, question }) => ({
            answer,
            question,
            sourceRecordId: sourceRecord.id,
          }))

          await transaction.sourceData.createMany({
            data: sourceDatas,
          })
        })
        .catch(err => {
          log.error({ err }, err.message)
          throw new ApiError('Unexpected error while saving data.', 500)
        })

      reply.status(201)
    },
  })
}

export default sourceRecordRoutes
