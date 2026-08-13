import express from 'express';
import "dotenv/config";
import migateRoute from './migrate.js';
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "./models/index.js";
import sequelize from "./clients/db.sequelize.js";


import usersRouter from "./routes/index.js";
import path from "path";

const app = express();

const PORT = process.env.PORT || 3000;

migateRoute();

//
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));
app.use("/media", express.static("public/media"));

//
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(usersRouter);


sequelize.sync()
    .then(() => {
        console.log("Tables synced");
    })
    .catch(console.error);



app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})

