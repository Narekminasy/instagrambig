import Router from  'express'
import UserController from './users.js';
import commentsRouter from './comments.js'
import postsRouter from './posts.js'
import profileRouter from './profile.js'


const router = Router();

router.use('/users', UserController);
router.use('/comments',commentsRouter);
router.use('/posts',postsRouter);
router.use('/profile',profileRouter);

export default router;