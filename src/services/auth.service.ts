import bcrypt from "bcryptjs"
import { UserModel } from "../models/user.model"
import { ApiError, AuthTokens } from "../types"
import { TokenService } from "./token.service"

export class AuthService {
  static async signUp(id: string, password: string): Promise<AuthTokens> {
    const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(id)
    const isPhone = /^\+?[0-9]{10,15}$/.test(id)

    if (!isEmail && !isPhone) {
      throw ApiError.BadRequest("ID must be valid email or phone number")
    }

    const existingUser = await UserModel.exists(id)
    if (existingUser) {
      throw ApiError.BadRequest("User with this ID already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await UserModel.create({ id, password: hashedPassword })

    const tokens = TokenService.generateTokens(id)

    await TokenService.saveToken(id, tokens.refreshToken)

    return tokens
  }

  static async signIn(id: string, password: string): Promise<AuthTokens> {
    const user = await UserModel.findById(id)
    if (!user) {
      throw ApiError.BadRequest("User not found")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw ApiError.BadRequest("Invalid password")
    }

    const tokens = TokenService.generateTokens(id)

    await TokenService.saveToken(id, tokens.refreshToken)

    return tokens
  }

  static async refresh(refreshToken: string): Promise<AuthTokens> {
    return await TokenService.refreshTokens(refreshToken)
  }

  static async logout(refreshToken: string): Promise<void> {
    await TokenService.logout(refreshToken)
  }
}
