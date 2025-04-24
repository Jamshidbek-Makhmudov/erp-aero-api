import { Router } from "express"
import multer from "multer"
import { FileController } from "../controllers/file.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  FileController.uploadFile
)

router.get("/list", authMiddleware, FileController.getFileList)

router.get("/:id", authMiddleware, FileController.getFileById)

router.get("/download/:id", authMiddleware, FileController.downloadFile)

router.delete("/delete/:id", authMiddleware, FileController.deleteFile)

router.put(
  "/update/:id",
  authMiddleware,
  upload.single("file"),
  FileController.updateFile
)

export default router
