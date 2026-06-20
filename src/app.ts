import express from "express";
import { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import dotenv from "dotenv";
import { ConnectDatabase } from "./database.js";
import appRouter from "./appRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: ".env" });

ConnectDatabase();

const app = express();

const whitelist = ["http://localhost:5173", "http://localhost:4000"];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error("Not allowed by CORS")); // Block request
    }
  },
  credentials: true, // If you use cookies/sessions
};

app

  .use(morgan("dev"))

  .use(cookieParser())

  .use(cors(corsOptions))

  .use(express.json({ limit: "100mb" }))

  .use("/api", appRouter)

  .use(express.static(path.join(__dirname, "build")))

  .listen(3000, () => {
    console.log("Server started on port 3000");
  });
