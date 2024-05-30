require("dotenv").config()
require("express-async-errors")

const express = require("express")
const app = express()

// Rest of the packages
const morgan = require("morgan") //HTTP request logger middleware
const cookieParser = require("cookie-parser")

// Require Database
const connectDB = require("./db/connect")

// Require Routes
const authRouter = require("./routes/authRoutes")
const userRouter = require("./routes/userRoutes")


// Require Middleware
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

// Invoke Extra packages
app.use(morgan("tiny"))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static("./public"))

// Home get
app.get("/", (req, res) => {
  res.send("<h1> E-Commerce API</h1>")
})


// Testing route
app.get("/api/v1/", (req, res) => {
  // console.log(req.cookies)
  // console.log(req.signedCookies)
  res.send("E-commerce API")
})


// Invoke Routers
app.use("/api/v1/users", userRouter)
app.use("/api/v1/auth", authRouter)


// Invoke Middleware
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000
const start = async () => {
  try {
    // Connect database
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () =>
      console.log(`🚀 Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
