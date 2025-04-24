import { NextFunction, Request, Response } from "express"
import { validationResult } from "express-validator"
import { AuthRequest } from "../middleware/auth.middleware"
import { AuthService } from "../services/auth.service"
import { ApiError } from "../types"

export class AuthController {
  static async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()))
      }

      const { id, password } = req.body
      const tokens = await AuthService.signUp(id, password)

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })

      return res.json({
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      })
    } catch (e) {
      next(e)
    }
  }

  static async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest("Validation error", errors.array()))
      }

      const { id, password } = req.body
      const tokens = await AuthService.signIn(id, password)

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })

      return res.json({
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      })
    } catch (e) {
      next(e)
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        return next(ApiError.BadRequest("Refresh token is required"))
      }

      const tokens = await AuthService.refresh(refreshToken)

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })

      return res.json({
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      })
    } catch (e) {
      next(e)
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken

      if (!refreshToken) {
        return next(ApiError.BadRequest("Refresh token is required"))
      }

      await AuthService.logout(refreshToken)

      res.clearCookie("refreshToken")

      return res.json({ message: "Successfully logged out" })
    } catch (e) {
      next(e)
    }
  }

  static async getUserInfo(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError())
      }

      return res.json({ id: req.user.userId })
    } catch (e) {
      next(e)
    }
  }
}
