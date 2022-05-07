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

// 💥 ԱՎԵԼԱՑՎԱԾ Է. Ներմուծում ենք հաղորդագրությունների մոդելը
import Messages from "./models/messages.js";

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const io = new Server(server);

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
    .then(() => { console.log("Tables synced"); })
    .catch(console.error);


const users = {};

io.on("connection", (socket) => {
    console.log(`\n[SOCKET] 🟢 Նոր բրաուզեր միացավ: ${socket.id}`);

    // Օգտատիրոջ գրանցում
    socket.on("registerUser", (userId) => {
        users[String(userId)] = socket.id;
        console.log(`[REGISTER] 👤 Օգտատեր [${userId}]-ը հիմա օնլայն է:`);

        // Ակնթարթորեն բոլորին ուղարկում ենք օնլայնների ցուցակը
        io.emit("updateUserStatus", Object.keys(users));
    });

    // Անձնական նամակի լսում և վերահասցեագրում
    // 💥 ՈՒՂՂՎԱԾ Է. Ֆունկցիան դարձրել ենք async՝ բազայի հետ աշխատելու համար
    socket.on("private message", async (data) => {
        const recipientId = String(data.recipientId);
        const text = data.text;

        // Գտնում ենք, թե ով է ուղարկողը ըստ իր սոկետի
        const senderId = Object.keys(users).find(key => users[key] === socket.id) || data.senderId;

        console.log(`\n--- 📥 ՆՈՐ ՀԱՂՈՐԴԱԳՐՈՒԹՅՈՒՆ ---`);
        console.log(`✍️ ՈՒՂԱՐԿՈՂ (Sender ID): ${senderId}`);
        console.log(`🎯 ՍՏԱՑՈՂ (Recipient ID): ${recipientId}`);
        console.log(`💬 ՏԵՔՍՏ: "${text}"`);

        // 💥 ԱՎԵԼԱՑՎԱԾ Է. Նամակի ավտոմատ պահպանում տվյալների բազայում
        try {
            if (text && senderId && recipientId) {
                await Messages.create({
                    userId: senderId,    // Ով է ուղարկել
                    sendId: recipientId, // Ում է գնացել
                    message: text        // Բուն հաղորդագրությունը
                });
                console.log("💾 Նամակը հաջողությամբ գրանցվեց տվյալների բազայում:");
            }
        } catch (dbError) {
            console.error("❌ Սխալ՝ նամակը բազայում պահելիս:", dbError);
        }

        // Real-time ուղարկում ստացողին, եթե նա օնլայն է
        const recipientSocketId = users[recipientId];

        if (recipientSocketId) {
            console.log(`🚀 Ստացողը օնլայն է: Ուղարկում ենք...`);
            io.to(recipientSocketId).emit("receive private", {
                senderId: senderId,
                text: text
            });
        } else {
            console.log(`⚠️ Ստացողը օֆլայն է:`);
        }
        console.log(`---------------------------------\n`);
    });

    // Դուրս գալու դեպքում
    socket.on("disconnect", () => {
        for (let userId in users) {
            if (users[userId] === socket.id) {
                console.log(`[SOCKET] 🔴 Օգտատեր [${userId}]-ը դուրս եկավ:`);
                delete users[userId];
                break;
            }
        }
        // Թարմացնում ենք բոլորի կարգավիճակը
        io.emit("updateUserStatus", Object.keys(users));
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
