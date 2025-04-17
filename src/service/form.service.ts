import { Form, SourceRecord } from '@prisma/client'
import prisma from '../db/db_client'
import { ICreateFormDTO } from 'routes/schemas/common'

export class FormService {
  async findAll(): Promise<Form[]> {
    return await prisma.form.findMany()
  }

  async findByIdOrThrow(id: string): Promise<Form> {
    return await prisma.form.findFirstOrThrow({
      where: {
        id,
      },
    })
  }

  async findByName(name: string): Promise<Form | null> {
    return await prisma.form.findFirst({
      where: {
        name,
      },
    })
  }

  async findFormSourceRecordById(id: string): Promise<SourceRecord[]> {
    const form = await this.findByIdOrThrow(id)

    const sourceRecord = await prisma.sourceRecord.findMany({
      where: {
        formId: form.id,
      },
      include: {
        sourceData: true,
      },
    })

    return sourceRecord
  }

  async createForm(formToCreate: ICreateFormDTO) {
    return await prisma.form.create({
      data: {
        name: formToCreate.name,
        fields: JSON.parse(formToCreate.fields),
      },
    })
  }

  async deleteForm(id: string) {
    await prisma.$transaction(async transaction => {
      await transaction.sourceData.deleteMany({
        where: {
          sourceRecord: {
            formId: id,
          },
        },
      })

      await transaction.sourceRecord.deleteMany({
        where: {
          formId: id,
        },
      })

      await transaction.form.delete({
        where: {
          id: id,
        },
      })
    })
  }
}
