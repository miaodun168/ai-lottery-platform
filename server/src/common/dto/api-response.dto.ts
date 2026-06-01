export class ApiResponse<T = any> {
  code: number
  message: string
  data?: T

  static ok<T>(data?: T): ApiResponse<T> {
    return { code: 0, message: 'success', data }
  }

  static fail(message: string, code = 500): ApiResponse {
    return { code, message }
  }
}
