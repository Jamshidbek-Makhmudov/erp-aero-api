import jwt from "jsonwebtoken"
import { TokenModel } from "../models/token.model"
import { ApiError, AuthTokens, DecodedToken } from "../types"

export class TokenService {
  static generateTokens(userId: string): AuthTokens {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || "jwt_secret", {
      expiresIn: "10m",
    })

    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_SECRET || "refresh_secret",
      { expiresIn: "30d" }
    )

    return { token, refreshToken }
  }

  static async saveToken(
    userId: string,
    refreshToken: string
  ): Promise<number> {
    return await TokenModel.create({
      user_id: userId,
      refresh_token: refreshToken,
    })
  }

  static validateAccessToken(token: string): DecodedToken | null {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || "jwt_secret"
      ) as DecodedToken
    } catch (e) {
      return null
    }
  }

  static validateRefreshToken(token: string): DecodedToken | null {
    try {
      return jwt.verify(
        token,
        process.env.REFRESH_SECRET || "refresh_secret"
      ) as DecodedToken
    } catch (e) {
      return null
    }
  }

  static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }

    const userData = this.validateRefreshToken(refreshToken)
    const tokenFromDb = await TokenModel.findByRefreshToken(refreshToken)

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }

    const tokens = this.generateTokens(userData.userId)

    await TokenModel.invalidateToken(refreshToken)

    await this.saveToken(userData.userId, tokens.refreshToken)

    return tokens
  }

  static async logout(refreshToken: string): Promise<void> {
    await TokenModel.invalidateToken(refreshToken)
  }
}
