import pool from "../config/db"
import { User } from "../types"

export class UserModel {
  static async create(user: User): Promise<void> {
    const [result] = await pool.execute(
      "INSERT INTO users (id, password) VALUES (?, ?)",
      [user.id, user.password]
    )
    return result as any
  }

  static async findById(id: string): Promise<User | null> {
    const [rows]: any = await pool.execute("SELECT * FROM users WHERE id = ?", [
      id,
    ])
    return rows.length ? rows[0] : null
  }

  static async exists(id: string): Promise<boolean> {
    const [rows]: any = await pool.execute("SELECT 1 FROM users WHERE id = ?", [
      id,
    ])
    return rows.length > 0
  }
}
