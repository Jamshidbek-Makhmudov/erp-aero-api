import pool from "../config/db"
import { TokenData } from "../types"

export class TokenModel {
  static async create(
    tokenData: Omit<TokenData, "id" | "created_at" | "is_valid">
  ): Promise<number> {
    const [result]: any = await pool.execute(
      "INSERT INTO tokens (user_id, refresh_token) VALUES (?, ?)",
      [tokenData.user_id, tokenData.refresh_token]
    )
    return result.insertId
  }

  static async findByRefreshToken(
    refreshToken: string
  ): Promise<TokenData | null> {
    const [rows]: any = await pool.execute(
      "SELECT * FROM tokens WHERE refresh_token = ? AND is_valid = TRUE",
      [refreshToken]
    )
    return rows.length ? rows[0] : null
  }

  static async invalidateToken(refreshToken: string): Promise<void> {
    await pool.execute(
      "UPDATE tokens SET is_valid = FALSE WHERE refresh_token = ?",
      [refreshToken]
    )
  }

  static async invalidateAllUserTokens(userId: string): Promise<void> {
    await pool.execute("UPDATE tokens SET is_valid = FALSE WHERE user_id = ?", [
      userId,
    ])
  }
}
