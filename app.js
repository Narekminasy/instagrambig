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
////
import usersRouter from "./routes/index.js";

const app = express();

const PORT = process.env.PORT || 3000;


const server = createServer(app);
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

const users = {};

io.on("connection", (socket) => {
    console.log(`Նոր բրաուզեր միացավ. ${socket.id}`);

    socket.on("registerUser", (userId) => {
        users[String(userId)] = socket.id;
        console.log(`Օգտատեր ${userId}-ը գրանցվեց սերվերում:`);
    });

    // 3. Լսում ենք անձնական նամակի «տուփը»
    socket.on("private message", (data) => {
        const recipientId = data.recipientId;
        const text = data.text;

        const recipientSocketId = users[String(recipientId)];

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive private", {
                text: text
            });
        } else {
            console.log(`Օգտատեր ${recipientId}-ը այս պահին օֆլայն է:`);
        }
    });

    socket.on("disconnect", () => {
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                console.log(`Օգտատեր ${userId}-ը դուրս եկավ:`);
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});