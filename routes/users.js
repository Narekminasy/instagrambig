import { Router } from "express";
import validation from "../middlewares/validation.js";
import schema from "../middlewares/schemas/users.schema.js";
import {controller as loginController, controller} from "../controllers/Users.js";
import auth from "../middlewares/authorization.js"
import posts from "../models/posts.js";
import users from "../models/users.js";
// import admin from "../middlewares/admin.js";
// import postsController from "../controllers/postsControllers.js";

const router = Router();

router.get("/home", auth, async (req, res, next) => {
   res.render('home');
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post(
    "/register",
    validation(schema.register, "body"),
    controller.register
);

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/index", auth, async (req, res, next) => {
    try {
        const allPosts = await posts.findAll({
            include: [{
                model: users,
                attributes: ['name']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.render('index', { posts: allPosts });

    } catch (error) {
        next(error);
    }
});

router.post(
    "/login",
    validation(schema.login, "body"),
    controller.login
);



router.get("/logout", controller.logout);

router.get("/about", (req, res) => {
    res.render("about");
});

router.get("/contact", (req, res) => {
    res.render("contact");
});

router.get("/users", (req, res) => {
    res.render("users");
});



export default router;