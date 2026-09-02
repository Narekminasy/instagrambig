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



import Messages from "./models/messages.js";

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server);

app.get("/", async (req, res) => {
    try {
        let posts = [];

        if (typeof Post !== 'undefined') {
            posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
        }

        res.render("home", { posts: posts });
    } catch (error) {
        console.error(error);
        res.render("home", { posts: [] });
    }
});

// Migrate
migateRoute();

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

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
    socket.on("registerUser", (userId) => {
        users[String(userId)] = socket.id;
        io.emit("updateUserStatus", Object.keys(users));
    });

    socket.on("private message", async (data) => {
        const recipientId = String(data.recipientId);
        const text = data.text;

        const senderId = Object.keys(users).find(key => users[key] === socket.id) || data.senderId;

        try {
            if (text && senderId && recipientId) {
                await Messages.create({
                    userId: senderId,
                    sendId: recipientId,
                    message: text
                });

            }
        } catch (dbError) {
            console.error(dbError);
        }

        const recipientSocketId = users[recipientId];

        if (recipientSocketId) {
            console.log(`Online`);
            io.to(recipientSocketId).emit("receive private", {
                senderId: senderId,
                text: text
            });
        } else {
            console.log(`Offline`);
        }
    });

    socket.on("disconnect", () => {
        for (let userId in users) {
            if (users[userId] === socket.id) {
                console.log(`[SOCKET][${userId}]`);
                delete users[userId];
                break;
            }
        }
        io.emit("updateUserStatus", Object.keys(users));
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
