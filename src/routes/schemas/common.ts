import { Static, Type } from '@sinclair/typebox'

import { StringValidJson, Uuid } from './typebox_base'

export const VialSuccessResponse = Type.Object({
  statusCode: Type.Number(),
  message: Type.String(),
  data: Type.Any(),
})

export type IVialSuccessResponse = Static<typeof VialSuccessResponse>

export const ApiErrorResponse = Type.Object({
  name: Type.String(),
  statusCode: Type.Number(),
  message: Type.String(),
  stack: Type.String(),
})

export type IApiErrorResponse = Static<typeof ApiErrorResponse>

export const EntityId = Type.Object({
  id: Uuid(),
})

export type IEntityId = Static<typeof EntityId>

export const CreateFormDTO = Type.Object({
  name: Type.String(),
  fields: StringValidJson(),
})

export type ICreateFormDTO = Static<typeof CreateFormDTO>

export const CreateSourceDataDTO = Type.Object({
  question: Type.String(),
  answer: Type.String(),
})

export const CreateSourceRecordDTO = Type.Object({
  formId: Uuid(),
  answers: Type.Array(CreateSourceDataDTO, {
    minItems: 1,
  }),
})

export type ICreateSourceRecordDTO = Static<typeof CreateSourceRecordDTO>

export const SourceDataSchema = Type.Object({
  id: Uuid(),
  answer: Type.String(),
  fieldId: Uuid(),
})

export type ISourceDataSchema = Static<typeof SourceDataSchema>

export const SourceRecordSchema = Type.Object({
  id: Uuid(),
  formId: Uuid(),
  sourceData: Type.Array(SourceDataSchema),
})

export type ISourceRecordSchema = Static<typeof SourceRecordSchema>

export const FormSchema = Type.Object({
  id: Uuid(),
  name: Type.String(),
  fields: Type.Array(StringValidJson()),
})

export type IFormSchema = Static<typeof FormSchema>
