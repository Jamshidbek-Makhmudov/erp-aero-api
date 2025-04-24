import { NextFunction, Response } from "express"
import fs from "fs"
import { AuthRequest } from "../middleware/auth.middleware"
import { FileService } from "../services/file.service"
import { ApiError } from "../types"

export class FileController {
  static async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError())
      }

      if (!req.file) {
        return next(ApiError.BadRequest("No file uploaded"))
      }

      const file = await FileService.uploadFile(req.user.userId, req.file)

      return res.status(201).json(file)
    } catch (e) {
      next(e)
    }
  }

  static async getFileList(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError())
      }

      const list_size = req.query.list_size
        ? parseInt(req.query.list_size as string)
        : undefined
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined

      const fileList = await FileService.getFileList(req.user.userId, {
        list_size,
        page,
      })

      return res.json(fileList)
    } catch (e) {
      next(e)
    }
  }

  static async getFileById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError())
      }

      const fileId = req.params.id

      const file = await FileService.getFileById(fileId)

      if (file.user_id !== req.user.userId) {
        return next(
          ApiError.Forbidden("You do not have permission to access this file")
        )
      }

      return res.json(file)
    } catch (e) {
      next(e)
    }
  }

  static async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError())
      }

      const fileId = req.params.id

      await FileService.deleteFile(fileId, req.user.userId)

      return res.json({ message: "File successfully deleted" })
    } catch (e) {
      next(e)
    }
  }

  static async downloadFile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError())
      }

      const fileId = req.params.id

      const { filePath, file } = await FileService.downloadFile(
        fileId,
        req.user.userId
      )

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.name}.${file.extension}"`
      )
      res.setHeader("Content-Type", file.mime_type)

      const fileStream = fs.createReadStream(filePath)
      fileStream.pipe(res)
    } catch (e) {
      next(e)
    }
  }

  static async updateFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(ApiError.UnauthorizedError())
      }

      const fileId = req.params.id

      if (!req.file) {
        return next(ApiError.BadRequest("No file uploaded"))
      }

      const updatedFile = await FileService.updateFile(
        fileId,
        req.user.userId,
        req.file
      )

      return res.json(updatedFile)
    } catch (e) {
      next(e)
    }
  }
}
