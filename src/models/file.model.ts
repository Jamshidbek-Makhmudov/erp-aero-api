import pool from "../config/db"
import { FileData, FileListParams, FileListResult } from "../types"

export class FileModel {
  static async create(fileData: FileData): Promise<void> {
    await pool.execute(
      "INSERT INTO files (id, user_id, name, extension, mime_type, size, path) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        fileData.id,
        fileData.user_id,
        fileData.name,
        fileData.extension,
        fileData.mime_type,
        fileData.size,
        fileData.path,
      ]
    )
  }

  static async findById(id: string): Promise<FileData | null> {
    const [rows]: any = await pool.execute("SELECT * FROM files WHERE id = ?", [
      id,
    ])
    return rows.length ? rows[0] : null
  }

  static async getList(
    userId: string,
    params: FileListParams
  ): Promise<FileListResult> {
    const pageSize = params.list_size || 10
    const page = params.page || 1
    const offset = (page - 1) * pageSize

    const [countResult]: any = await pool.execute(
      "SELECT COUNT(*) as total FROM files WHERE user_id = ?",
      [userId]
    )
    const total = countResult[0].total

    const [rows]: any = await pool.execute(
      "SELECT * FROM files WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT ? OFFSET ?",
      [userId, pageSize, offset]
    )

    return {
      files: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  static async delete(id: string): Promise<boolean> {
    const [result]: any = await pool.execute("DELETE FROM files WHERE id = ?", [
      id,
    ])
    return result.affectedRows > 0
  }

  static async update(
    id: string,
    fileData: Partial<FileData>
  ): Promise<boolean> {
    const fields = Object.keys(fileData).filter(
      (key) => key !== "id" && key !== "user_id"
    )
    if (fields.length === 0) return false

    const setClause = fields.map((field) => `${field} = ?`).join(", ")
    const values = fields.map((field) => (fileData as any)[field])

    const [result]: any = await pool.execute(
      `UPDATE files SET ${setClause} WHERE id = ?`,
      [...values, id]
    )

    return result.affectedRows > 0
  }

  static async belongsToUser(fileId: string, userId: string): Promise<boolean> {
    const [rows]: any = await pool.execute(
      "SELECT 1 FROM files WHERE id = ? AND user_id = ?",
      [fileId, userId]
    )
    return rows.length > 0
  }
}
