import { FastifyReply, FastifyRequest } from 'fastify'
import { IVialSuccessResponse } from 'routes/schemas/common'

const preSerializer = async (
  request: FastifyRequest,
  reply: FastifyReply,
  payload: any
): Promise<IVialSuccessResponse> => {
  // Ensure every response (not errors) have the {statusCode, data, message} format

  return {
    statusCode: reply.statusCode,
    data: payload,
    message: 'success',
  }
}

export function serializer(data: any, statusCode: number) {
  return JSON.stringify({
    statusCode,
    data,
    message: 'success',
  })
}

export default preSerializer
