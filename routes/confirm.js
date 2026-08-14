import {Router} from "express";

import {controller as loginController, controller} from "../controllers/Users.js";
import auth from "../middlewares/authorization.js";
import admin from "../middlewares/admin.js";
import upload from "../middlewares/upload.js";
import postsController from "../controllers/postsControllers.js";
import Confirm from '../models/confirm.js'
import Post from "../models/posts.js";

const router = Router();


router.post(
    '/confirm',
    auth,
    upload.array("image", 3),
    controller.getConfirm
);

router.get('/all-users',auth);

//controller.getAllUsers

router.get('/all-users-progile',auth, controller.getAllprofile);


router.get("/all-users", auth, async (req, res, next) => {
    try {
        const allProfiles = await Confirm.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.render("profile", {
            profiles: allProfiles
        });
    } catch (e) {
        next(e);
    }
});

router.get("/all-profiles/:id", auth, async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id; // Լոգին եղած մարդու ID-ն

        // 1. Գտնում ենք այն մարդու պրոֆիլը, ում էջում գտնվում ենք
        const userConfirm = await Confirm.findOne({
            where: { userId: targetUserId }
        });

        if (!userConfirm) {
            return res.status(404).send("User profile not found");
        }

        // 2. ԱՎԵԼԱՑՎԱԾ Է՝ Գտնում ենք ՆԱԵՎ ՔՈ ՍԵՓԱԿԱՆ պրոֆիլը՝ անունդ իմանալու համար
        const myConfirm = await Confirm.findOne({
            where: { userId: currentUserId }
        });

        const posts = await Post.findAll({
            where: { userId: targetUserId }
        });

        const isOwnProfile = Number(targetUserId) === Number(currentUserId);

        res.render("users", {
            confirmData: userConfirm,
            isOwnProfile: isOwnProfile,
            posts: posts,
            user: req.user,
            // Փոխանցում ենք քո սեփական պրոֆիլի տվյալները HTML-ին
            myConfirmData: myConfirm
        });

    } catch (e) {
        next(e);
    }
});

router.post('/updatePhotos', auth, upload.array("image", 2),controller.updatePhotos);





export default router;

