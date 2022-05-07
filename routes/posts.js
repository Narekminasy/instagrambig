import {Router} from "express";

import postsController from "../controllers/postsControllers.js";
import auth from '../middlewares/authorization.js'
import upload from "../middlewares/upload.js";
import admin from "../middlewares/admin.js";


const router = Router();

// router.post('/posts',auth, upload.single("image"),postsController.createPosts);

router.post(
    '/posts',
    auth,
    admin,
    upload.single("image"),
    postsController.createPosts
);

router.get('/all-posts',auth, postsController.getAllPosts);

// router.post(
//     '/:id',
//     auth,
//     admin,
//     postsController.deletePosts
// );
router.delete("/:id", auth, admin, (req, res, next) => {
    // console.log("DELETE ROUTE WORKS", req.params.id);
    next();
}, postsController.deletePosts);

// router.delete('/posts/:id',auth, postsController.deletePosts);


export default router