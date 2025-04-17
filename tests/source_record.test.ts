import { expect, test, vi, beforeEach, describe } from 'vitest'
import { SourceRecordService } from '../src/service/source_record.service'
import { ICreateSourceRecordDTO } from 'routes/schemas/common'
import prisma from '../src/db/__mocks__/db_client'
import { SourceRecord, SourceData } from '@prisma/client'

vi.mock('../src/db/db_client')

describe('SourceRecordService', () => {
  const service = new SourceRecordService()

  test('should delete form and related data in transaction', async () => {
    const newSourceRecord: ICreateSourceRecordDTO = {
      formId: '123',
      sourceData: [
        { question: 'Question1', answer: 'Answer1' },
        { question: 'Question2', answer: 'Answer2' },
      ],
    }

    const createdSourceRecord: SourceRecord = {
      id: '1',
      formId: '123',
    }

    const mockTransaction = vi.fn(async cb => await cb(prisma))
    prisma.$transaction = mockTransaction as any

    prisma.sourceRecord.create.mockResolvedValue(createdSourceRecord)

    await service.createSourceRecord(newSourceRecord)

    expect(mockTransaction).toHaveBeenCalled()
    expect(prisma.sourceRecord.create).toHaveBeenCalled()
    expect(prisma.sourceData.createMany).toHaveBeenCalled()
  })

  test('should handle error if transaction fails while creating source record or source data', async () => {
    const newSourceRecord: ICreateSourceRecordDTO = {
      formId: '123',
      sourceData: [
        { question: 'Question1', answer: 'Answer1' },
        { question: 'Question2', answer: 'Answer2' },
      ],
    }

    prisma.$transaction.mockRejectedValue(new Error('Transaction failed'))

    await expect(service.createSourceRecord(newSourceRecord)).rejects.toThrow(
      'Transaction failed'
    )
  })

  test('should fetch all source records with source data', async () => {
    const sourceRecordData: SourceRecord = {
      id: '1',
      formId: '123',
    }

    prisma.sourceRecord.findMany.mockResolvedValue([sourceRecordData])

    const result = await service.findAll()

    expect(result).toEqual([sourceRecordData])
    expect(prisma.sourceRecord.findMany).toHaveBeenCalledWith({
      include: {
        sourceData: true,
      },
    })
  })
})
