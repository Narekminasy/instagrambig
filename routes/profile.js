import {Router} from "express";

const router = Router();


router.post('/confirm',postsController.getAllPosts);


export default router;