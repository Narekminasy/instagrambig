import { Router } from "express";
import validation from "../middlewares/validation.js";
import schema from "../middlewares/schemas/users.schema.js";
import {controller as loginController, controller} from "../controllers/Users.js";
// import {messagesController } from "../controllers/messagesController.js"
import messagesController from "../controllers/messagesController.js";
import auth from "../middlewares/authorization.js"
import posts from "../models/posts.js";
import users from "../models/users.js";
import Confirm from '../models/confirm.js'
import comments from '../models/Comments.js';
import { Op } from "sequelize"; //
import Messages from "../models/messages.js";

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
                    attributes: ['name']
                },
                {
                    model: comments,
                    include: [{
                        model: users,
                        as: 'User',
                        attributes: ['id', 'name']
                    }]
                }
            ],
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
                isApparatus: true
            },
            include: [{
                model: users,
                attributes: ['name', 'role']
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
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        const history = await Messages.findAll({
            where: {
                [Op.or]: [
                    { userId: currentUserId, sendId: targetUserId },
                    { userId: targetUserId, sendId: currentUserId }
                ]
            },
            order: [["created_at", "ASC"]]
        });


        res.render("chat", {
            targetUserId: targetUserId,
            currentUserId: currentUserId,
            history: history
        });

    } catch (e) {
        next(e);
    }
});

router.delete("/:id", auth, messagesController.deleteMessage);



export default router;