import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
let DATABASE_LOCAL = process.env.DATABASE_LOCAL || "";
let DATABASE_ONLINE = process.env.DATABASE_ONLINE || "";
const DATABASE = process.env.NODE_ENV === "production" ? DATABASE_ONLINE : DATABASE_LOCAL;
console.log(DATABASE);
export const ConnectDatabase = () => {
    mongoose
        .connect(DATABASE, {
        connectTimeoutMS: 60000,
        serverSelectionTimeoutMS: 60000,
    })
        .then(() => {
        console.log("Database connected successfully");
    })
        .catch((e) => {
        console.log(e);
        console.log("DB could not connect at this time. Shutting down");
        process.exit(1);
    });
};
//# sourceMappingURL=database.js.map