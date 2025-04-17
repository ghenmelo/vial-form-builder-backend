import { Form, SourceRecord } from '@prisma/client'
import prisma from '../db/db_client'
import { ICreateFormDTO, ICreateSourceRecordDTO } from 'routes/schemas/common'

export class SourceRecordService {
  async findAll(): Promise<SourceRecord[]> {
    return await prisma.sourceRecord.findMany({
      include: {
        sourceData: true,
      },
    })
  }

  async createSourceRecord(body: ICreateSourceRecordDTO) {
    await prisma.$transaction(async transaction => {
      const sourceRecord = await transaction.sourceRecord.create({
        data: {
          formId: body.formId,
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
  }
}
