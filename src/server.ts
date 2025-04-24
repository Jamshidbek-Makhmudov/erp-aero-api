import dotenv from "dotenv"
import app from "./app"
import { initializeDatabase } from "./config/db"

dotenv.config()

initializeDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error)
    process.exit(1)
  })
