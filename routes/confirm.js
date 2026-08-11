import {Router} from "express";

import {controller as loginController, controller} from "../controllers/Users.js";
import auth from "../middlewares/authorization.js";
import admin from "../middlewares/admin.js";
import upload from "../middlewares/upload.js";
import postsController from "../controllers/postsControllers.js";
import Confirm from '../models/confirm.js'

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
        const targetUserId = req.params.id; // Վերցնում ենք URL-ի միջի ID-ն
        const currentUserId = req.user.id;  // Քո սեփական ID-ն token-ից

        // Բազայից փնտրում ենք միայն այս օգտատիրոջ հաստատված տվյալները
        const userConfirm = await Confirm.findOne({
            where: { userId: targetUserId }
        });

        if (!userConfirm) {
            return res.status(404).send("User profile not found");
        }

        // Ստուգում ենք՝ արդյոք սա իմ սեփական էջն է
        const isOwnProfile = (Number(targetUserId) === Number(currentUserId));

        // Ռենդեր ենք անում քո users.ejs էջը
        res.render("users", {
            confirmData: userConfirm,
            isOwnProfile: isOwnProfile
        });
    } catch (e) {
        next(e);
    }
});





export default router;

