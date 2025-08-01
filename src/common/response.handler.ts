// src/common/response.handler.ts

export interface ApiResponse<T = any> {
  statusCode: number;
  statusMessage: string;
  data?: T | null;
}

/**
 * Creates a standardized success response.
 *
 * @param data - The response data payload
 * @param statusMessage - A success message (default: 'Success')
 * @param statusCode - HTTP status code (default: 200)
 * @returns ApiResponse<T>
 */
export function successResponse<T>(
  data: T,
  statusMessage = 'Success',
  statusCode = 200
): ApiResponse<T> {
  return {
    statusCode,
    statusMessage,
    data,
  };
}

/**
 * Creates a standardized error response.
 *
 * @param statusMessage - Error message (default: 'Something went wrong')
 * @param statusCode - HTTP status code (default: 500)
 * @returns ApiResponse<null>
 */
export function errorResponse(
  statusMessage = 'Something went wrong',
  statusCode = 500
): ApiResponse<null> {
  return {
    statusCode,
    statusMessage,
    data: null,
  };
}
