import { Router } from "express";
import validation from "../middlewares/validation.js";
import schema from "../middlewares/schemas/users.schema.js";
import {controller as loginController, controller} from "../controllers/Users.js";
import auth from "../middlewares/authorization.js"
import posts from "../models/posts.js";
import users from "../models/users.js";
import Confirm from '../models/confirm.js'
import comments from '../models/Comments.js';


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
            include: [
                {
                    model: users,
                    attributes: ['name'] // Պոստը գրողի անունը
                },
                {
                    model: comments, // Ներառում ենք պոստի մեկնաբանությունները
                    include: [{
                        model: users,
                        as: 'User', // Մեկնաբանությունը գրողի մոդելը (ըստ ձեր կապերի)
                        attributes: ['id', 'name'] // Մեկնաբանությունը գրողի տվյալները
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Էջին ուղարկում ենք միայն պոստերը, քանի որ մեկնաբանությունները արդեն դրանց ներսում են
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

router.post('/forgot-password', controller.forgotPassword);


router.get("/about", (req, res) => {
    res.render("about");
});

router.get("/contact", (req, res) => {
    res.render("contact");
});

router.get("/users", auth, async (req, res, next) => {
    try {

        const userId = req.user.id;

        const allPosts = await posts.findAll({
            where: { userId },
            include: [{
                model: users,
                attributes: ['name']
            }],
            order: [['createdAt', 'DESC']]
        });

        const userConfirm = await Confirm.findOne({
            where: { userId }
        });

        res.render("users", {
            confirmData: userConfirm,
            isOwnProfile: true,
            posts: allPosts
        });
    } catch (e) {
        next(e);
    }
});

router.get("/apparatus", auth, async (req, res, next) => {
    try {
        const allPosts = await posts.findAll({
            where: {
                isApparatus: true // Բերում է ՄԻԱՅՆ այն պոստերը, որոնք նշվել են որպես ապարատուրա
            },
            include: [{
                model: users,
                attributes: ['name', 'role'] // Պահում ենք հեղինակի տվյալները (անունը, դերը)
            }],
            order: [['createdAt', 'DESC']]
        });

        res.render("apparatus", {
            isOwnProfile: true,
            posts: allPosts
        });
    } catch (e) {
        next(e);
    }
});


router.get("/chat/:id", auth, async (req, res, next) => {
    try {
        const targetUserId = req.params.id; // Ում որ սեղմել ենք
        const currentUserId = req.user.id;  // Ով որ հիմա լոգին է եղել

        res.render("chat", {
            targetUserId: targetUserId,
            currentUserId: currentUserId
        });
    } catch (e) {
        next(e);
    }
});




export default router;