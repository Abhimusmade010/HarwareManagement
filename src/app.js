import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();



import connectDB from "./config/db.js";
connectDB();

import routes from "./routes/index.js";
import AppError from "./utils/AppError.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();
app.use(helmet());

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Routes
app.use("/api", routes); 


app.use(errorMiddleware);


export default app;

