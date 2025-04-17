import { expect, test, vi, describe, beforeEach } from 'vitest'
import { FormService } from '../src/service/form.service'
import { ICreateFormDTO } from 'routes/schemas/common'
import prisma from '../src/db/__mocks__/db_client'
import { Form, SourceRecord } from '@prisma/client'

vi.mock('../src/db/db_client')

describe('FormService', () => {
  const service = new FormService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should create and return a new form', async () => {
    const newForm: ICreateFormDTO = { name: 'TesteForm', fields: '{}' }
    prisma.form.create.mockResolvedValue({ ...newForm, id: '1' })

    const form = await service.createForm(newForm)
    expect(form).toStrictEqual({ ...newForm, id: '1' })
  })

  test('should return form by ID if it exists', async () => {
    const formById: Form = { name: 'TesteForm', fields: '{}', id: '123' }
    prisma.form.findFirstOrThrow.mockResolvedValue(formById)

    const form = await service.findByIdOrThrow('123')
    expect(form).toStrictEqual(formById)
  })

  test('should throw an error if form does not exist', async () => {
    prisma.form.findFirstOrThrow.mockRejectedValue(new Error('Form not found'))

    await expect(service.findByIdOrThrow('123')).rejects.toThrow(
      'Form not found'
    )
  })

  test('should return source records by form ID', async () => {
    const formById: Form = { name: 'TesteForm', fields: '{}', id: '123' }
    const sourceRecord: SourceRecord = { formId: '123', id: '10' }

    prisma.form.findFirstOrThrow.mockResolvedValue(formById)
    prisma.sourceRecord.findMany.mockResolvedValue([sourceRecord])

    const result = await service.findFormSourceRecordById('123')
    expect(result).toStrictEqual([sourceRecord])
  })

  test('should delete form and related data in transaction', async () => {
    const mockTransaction = vi.fn(async cb => await cb(prisma))
    prisma.$transaction = mockTransaction as any

    prisma.sourceData.deleteMany.mockResolvedValue({ count: 2 })
    prisma.sourceRecord.deleteMany.mockResolvedValue({ count: 3 })
    prisma.form.delete.mockResolvedValue({
      id: '123',
      name: 'Deleted',
      fields: '{}',
    })

    await service.deleteForm('123')

    expect(mockTransaction).toHaveBeenCalled()
    expect(prisma.sourceData.deleteMany).toHaveBeenCalledWith({
      where: { sourceRecord: { formId: '123' } },
    })
    expect(prisma.sourceRecord.deleteMany).toHaveBeenCalledWith({
      where: { formId: '123' },
    })
    expect(prisma.form.delete).toHaveBeenCalledWith({
      where: { id: '123' },
    })
  })
})
