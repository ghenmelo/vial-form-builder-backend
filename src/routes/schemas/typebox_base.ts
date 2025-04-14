import { StringOptions, Type } from '@sinclair/typebox'

export const Uuid = (options: Omit<StringOptions, 'format'> = {}) =>
  Type.String({
    format: 'uuid',
    ...options,
  })

export function StringValidJson(options: Omit<StringOptions, 'format'> = {}) {
  return Type.String({
    format: 'valid-json',
    ...options,
  })
}
