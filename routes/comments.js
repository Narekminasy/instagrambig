import {Router} from "express";

import commentsController from "../controllers/commentsController.js";
import auth from '../middlewares/authorization.js'
import admin from '../middlewares/admin.js'


const router = Router();


router.post('/comments',auth, commentsController.createMessage);

router.delete('/:id',auth, commentsController.deleteMessage);



export default router