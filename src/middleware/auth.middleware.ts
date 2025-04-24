import { NextFunction, Request, Response } from "express"
import { TokenService } from "../services/token.service"
import { ApiError } from "../types"

export interface AuthRequest extends Request {
  user?: {
    userId: string
  }
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return next(ApiError.UnauthorizedError())
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return next(ApiError.UnauthorizedError())
    }

    const userData = TokenService.validateAccessToken(token)
    if (!userData) {
      return next(ApiError.UnauthorizedError())
    }

    req.user = { userId: userData.userId }
    next()
  } catch (e) {
    return next(ApiError.UnauthorizedError())
  }
}
