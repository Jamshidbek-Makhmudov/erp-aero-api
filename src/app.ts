import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import path from "path"
import authRoutes from "./routes/auth.routes"
import fileRoutes from "./routes/file.routes"
import { errorHandler } from "./utils/error.handler"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
)

app.use("/", authRoutes)
app.use("/file", fileRoutes)

app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

app.use(errorHandler)

export default app
