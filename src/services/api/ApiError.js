import { isAxiosError } from 'axios'

// Frontend-only codes: these are not Backend ErrorCode values.
export const FRONTEND_ERROR_CODES = {
  NETWORK: 'FE_NETWORK_ERROR',
  UNKNOWN: 'FE_UNKNOWN_ERROR',
}

export class ApiError extends Error {
  /**
   * @param {{
   *   status: number | null,
   *   code: string,
   *   message: string,
   *   details?: unknown,
   *   response?: import('axios').AxiosResponse,
   *   cause?: unknown
   * }} options
   */
  constructor({ status, code, message, details, response, cause }) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.response = response
  }

  /** @param {import('axios').AxiosResponse} response @param {unknown} [cause] */
  static fromResponse(response, cause) {
    const body = response.data

    return new ApiError({
      status: response.status,
      code: typeof body?.code === 'string' ? body.code : FRONTEND_ERROR_CODES.UNKNOWN,
      message: typeof body?.message === 'string' ? body.message : 'Request failed',
      details: body?.data,
      response,
      cause,
    })
  }

  /** @param {unknown} error */
  static from(error) {
    if (error instanceof ApiError) return error
    if (isAxiosError(error) && error.response) {
      return ApiError.fromResponse(error.response, error)
    }

    return new ApiError({
      status: null,
      code: isAxiosError(error) ? FRONTEND_ERROR_CODES.NETWORK : FRONTEND_ERROR_CODES.UNKNOWN,
      message: error instanceof Error ? error.message : 'Request failed',
      cause: error,
    })
  }
}
