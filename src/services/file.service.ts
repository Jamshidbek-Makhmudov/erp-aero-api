import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { FileModel } from "../models/file.model"
import { ApiError, FileData, FileListParams, FileListResult } from "../types"

export class FileService {
  static UPLOAD_DIR =
    process.env.FILE_STORAGE_PATH || path.join(__dirname, "../../uploads")

  static async uploadFile(
    userId: string,
    file: Express.Multer.File
  ): Promise<FileData> {
    try {
      if (!fs.existsSync(this.UPLOAD_DIR)) {
        fs.mkdirSync(this.UPLOAD_DIR, { recursive: true })
      }

      const fileId = uuidv4()
      const fileExtension = path.extname(file.originalname).substring(1)
      const fileName = path.parse(file.originalname).name
      const uniqueFileName = `${fileId}.${fileExtension}`
      const filePath = path.join(this.UPLOAD_DIR, uniqueFileName)

      fs.writeFileSync(filePath, file.buffer)

      const fileData: FileData = {
        id: fileId,
        user_id: userId,
        name: fileName,
        extension: fileExtension,
        mime_type: file.mimetype,
        size: file.size,
        path: uniqueFileName,
      }

      await FileModel.create(fileData)
      return fileData
    } catch (error) {
      console.error("Error uploading file:", error)
      throw ApiError.Internal("Error uploading file")
    }
  }

  static async getFileList(
    userId: string,
    params: FileListParams
  ): Promise<FileListResult> {
    return await FileModel.getList(userId, params)
  }

  static async getFileById(fileId: string): Promise<FileData> {
    const file = await FileModel.findById(fileId)
    if (!file) {
      throw ApiError.NotFound("File not found")
    }
    return file
  }

  static async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await FileModel.findById(fileId)
    if (!file) {
      throw ApiError.NotFound("File not found")
    }

    if (file.user_id !== userId) {
      throw ApiError.Forbidden("You do not have permission to delete this file")
    }

    const filePath = path.join(this.UPLOAD_DIR, file.path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    const deleted = await FileModel.delete(fileId)
    if (!deleted) {
      throw ApiError.Internal("Failed to delete file")
    }
  }

  static async downloadFile(
    fileId: string,
    userId: string
  ): Promise<{ filePath: string; file: FileData }> {
    const file = await FileModel.findById(fileId)
    if (!file) {
      throw ApiError.NotFound("File not found")
    }

    if (file.user_id !== userId) {
      throw ApiError.Forbidden(
        "You do not have permission to download this file"
      )
    }

    const filePath = path.join(this.UPLOAD_DIR, file.path)
    if (!fs.existsSync(filePath)) {
      throw ApiError.NotFound("File not found on disk")
    }

    return { filePath, file }
  }

  static async updateFile(
    fileId: string,
    userId: string,
    file: Express.Multer.File
  ): Promise<FileData> {
    const existingFile = await FileModel.findById(fileId)
    if (!existingFile) {
      throw ApiError.NotFound("File not found")
    }

    if (existingFile.user_id !== userId) {
      throw ApiError.Forbidden("You do not have permission to update this file")
    }

    const oldFilePath = path.join(this.UPLOAD_DIR, existingFile.path)
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath)
    }

    const fileExtension = path.extname(file.originalname).substring(1)
    const fileName = path.parse(file.originalname).name
    const uniqueFileName = `${fileId}.${fileExtension}`
    const filePath = path.join(this.UPLOAD_DIR, uniqueFileName)

    fs.writeFileSync(filePath, file.buffer)

    const updatedFileData: Partial<FileData> = {
      name: fileName,
      extension: fileExtension,
      mime_type: file.mimetype,
      size: file.size,
      path: uniqueFileName,
    }

    await FileModel.update(fileId, updatedFileData)

    return {
      ...existingFile,
      ...updatedFileData,
    }
  }
}
