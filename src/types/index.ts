export interface User {
  id: string
  password: string
  created_at?: Date
}

export interface TokenData {
  id: number
  user_id: string
  refresh_token: string
  is_valid: boolean
  created_at?: Date
}

export interface FileData {
  id: string
  user_id: string
  name: string
  extension: string
  mime_type: string
  size: number
  path: string
  uploaded_at?: Date
}

export interface DecodedToken {
  userId: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  token: string
  refreshToken: string
}

export interface FileListParams {
  list_size?: number
  page?: number
}

export interface FileListResult {
  files: FileData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class ApiError extends Error {
  status: number
  errors: any[]

  constructor(status: number, message: string, errors: any[] = []) {
    super(message)
    this.status = status
    this.errors = errors
  }

  static UnauthorizedError() {
    return new ApiError(401, "User is not authorized")
  }

  static BadRequest(message: string, errors: any[] = []) {
    return new ApiError(400, message, errors)
  }

  static NotFound(message: string = "Resource not found") {
    return new ApiError(404, message)
  }

  static Forbidden(message: string = "Access forbidden") {
    return new ApiError(403, message)
  }

  static Internal(message: string = "Internal server error") {
    return new ApiError(500, message)
  }
}
