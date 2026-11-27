import { ApiError, FRONTEND_ERROR_CODES } from '@/services/api/ApiError'

/**
 * Extracts the payload from a REST ApiResponse, preserving null, false and zero.
 * @template T
 * @param {import('axios').AxiosResponse<{success: boolean, code: string, message: string, data: T}>} response
 * @returns {T | undefined}
 */
export function unwrap(response) {
  const body = response.data

  if (body === undefined || body === null || body === '') return undefined

  if (
    typeof body !== 'object' ||
    typeof body.success !== 'boolean' ||
    typeof body.code !== 'string'
  ) {
    throw new ApiError({
      status: response.status,
      code: FRONTEND_ERROR_CODES.UNKNOWN,
      message: 'Expected an ApiResponse envelope',
      response,
    })
  }

  if (!body.success) throw ApiError.fromResponse(response)
  return body.data
}
