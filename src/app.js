// App.js tells about build my application and not run my appplication. It is used to build the application and server.js is used to run the application.


import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import AppError from "./utils/AppError.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();


// ================Security Middlewares=================
// helmet helps secure your Express apps by setting various HTTP headers
app.use(helmet());

// =================Cors=================
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// =================Body Parser=================
app.use(express.json());
// this is for parsing application/x-www-form-urlencoded means data sent from forms, and it will be available in req.body
app.use(express.urlencoded({ extended: true }));


// Rate Limiting-this is for preventing brute force attacks and denial of service attacks, it limits the number of requests from a single IP address in a given time window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                       // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,                  
  legacyHeaders: false,  
});
app.use(limiter);

// =================Routes=================
app.use("/api", routes); 


// =================404 Handler=================
app.use((req, res, next) => {
  next(new AppError("Not Found", 404));
});

// =================Error Handler================= 
app.use(errorMiddleware);


export default app;

