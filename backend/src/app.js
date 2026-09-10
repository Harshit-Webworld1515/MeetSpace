import express from "express";
const app = express();
import mongoose from "mongoose";
// import { Server } from "socket.io";
import { createServer } from "node:http";
import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import "dotenv/config";
import userRoutes from "./routes/users.route.js";

const server = createServer(app);
//creating the socket server by passing the http server instance to it
// const io = new Server(server);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));
//Agar tum existing /api/v1/users ko directly change kar doge, to old frontend break ho sakta hai.
app.use("/api/v1/users", userRoutes);//V1 → old clients ke liye
// app.use("/api/v2/users", userRoutes);//V2 → new clients ke liye


app.set("port", process.env.PORT || 8080);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const startServer = async () => {
  const connectionDb = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB Atlas Host: ${connectionDb.connection.host}`);

  server.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get("port")}`);
  });
};

startServer();
