import { Router } from "express"
import { body } from "express-validator"
import { AuthController } from "../controllers/auth.controller"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.post(
  "/signup",
  [
    body("id").notEmpty().withMessage("ID is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  AuthController.signUp
)

router.post(
  "/signin",
  [
    body("id").notEmpty().withMessage("ID is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  AuthController.signIn
)

router.post("/signin/new_token", AuthController.refresh)

router.get("/info", authMiddleware, AuthController.getUserInfo)

router.get("/logout", authMiddleware, AuthController.logout)

export default router
