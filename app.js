import express from "express";
import "dotenv/config";
import migateRoute from "./migrate.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "./models/index.js";
import sequelize from "./clients/db.sequelize.js";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";

import usersRouter from "./routes/index.js";

const app = express();

const PORT = process.env.PORT || 3000;

// HTTP server
const server = createServer(app);

// Socket.IO
const io = new Server(server);

// migrate
migateRoute();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "views"));

// Static
app.use("/media", express.static("public/media"));
app.use(express.static("public"));

// Middleware
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(usersRouter);

// Database
sequelize.sync()
    .then(() => {
        console.log("Tables synced");
    })
    .catch(console.error);


// Socket.IO
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", (message) => {
        console.log("Message:", message);

        io.emit("newMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


// START SERVER
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});