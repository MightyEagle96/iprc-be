import express from "express";

import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import dotenv from "dotenv";
import { ConnectDatabase } from "./database.js";
import appRouter from "./appRouter.js";
import http from "http";
import { sendSms } from "./services/sms.api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: ".env" });

ConnectDatabase();

const app = express();

sendSms("Hello world", "2348131065776");

// const whitelist = [
//   "http://localhost:5173",
//   "http://localhost:3000",
//   "https://iprc-be.onrender.com",
//   "https://iprc.jamb.gov.ng",
// ];

// const corsOptions: cors.CorsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || whitelist.includes(origin)) {
//       callback(null, true); // Allow request
//     } else {
//       callback(new Error("Not allowed by CORS")); // Block request
//     }
//   },
//   credentials: true, // If you use cookies/sessions
// };
const whitelist = ["http://localhost:5173", "http://localhost:4002"];
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isLocalhost =
      origin.includes("localhost") || origin.includes("127.0.0.1");

    const isLAN =
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
      /^http:\/\/172\.20\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin) ||
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin);

    if (isLocalhost || isLAN || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions)).use(express.json()).use(morgan("dev"));

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    // origin: "http://localhost:5173",
    // methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

// app

//   .use(morgan("dev"))

//   .use(cookieParser())

//   .use(cors(corsOptions))

//   .use(express.json({ limit: "100mb" }))
//   .use(
//     express.urlencoded({
//       extended: true,
//       limit: "100mb",
//     }),
//   )

//   .use(express.static(path.join(__dirname, "build")))

//   .use("/api", appRouter)

//   .use((req, res) => {
//     res.sendFile(path.join(__dirname, "build", "index.html"));
//   });

app
  .use(morgan("dev"))

  .use(cookieParser())

  .use(cors(corsOptions))

  .use(express.json({ limit: "100mb" }))

  .use(
    express.urlencoded({
      extended: true,
      limit: "100mb",
    }),
  )

  .use(express.static(path.join(__dirname, "build")))

  .use("/api", appRouter)

  .use((req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
