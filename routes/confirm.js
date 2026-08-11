import {Router} from "express";

import {controller as loginController, controller} from "../controllers/Users.js";
import auth from "../middlewares/authorization.js";
import admin from "../middlewares/admin.js";
import upload from "../middlewares/upload.js";
import postsController from "../controllers/postsControllers.js";

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


export default router;

