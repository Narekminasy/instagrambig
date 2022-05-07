import posts from "../models/posts.js";
import users from "../models/users.js";
import comments from "../models/Comments.js";

const postsController = {

    async createPosts(req, res, next) {

        try {
            // Փոխեք սա.
            const userId = req.user.id; // 'req.user.userId'-ի փոխարեն


            const { title, description} = req.body;

            if (!req.file) {
                return res.status(400).json({ message: "upload failed." });
            }

            const existingPost = await posts.findOne({
                where: {
                    title: title,
                    userId: userId,
                    description: description,
                }
            });

            if (existingPost) {
                return res.status(400).json({
                    message: "already exist",
                });
            }

            const post = await posts.create({
                title,
                description,
                userId,
                image: req.file.filename,
            });
            // console.log('req.user',req.user);
            // console.log('userId',userId);
            return res.status(201).json({
                post,
                message: "Post created successfully"
            });
        } catch (e) {
            next(e);
        }
    },

    async getAllPosts(req, res, next) {
        try {
            const allPosts = await posts.findAll({
                include: [
                    {
                        model: users,
                        attributes: ['id', 'name', 'email'] // Օգտագործեք 'name', քանի որ 'firstName/lastName' չունեք մոդելում
                    },
                    {
                        model: comments,
                        attributes: ['id', 'message', 'createdAt'],
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.json({
                posts: allPosts,
                message: "All posts retrieved successfully"
            });
        } catch (e) {
            console.log("ERROR:", e.message);
            console.log(e);
            next(e);
        }
    },
    async deletePosts(req, res, next) {
        try {
            const postId = req.params.id;

            if (!postId) {
                return res.status(400).json({
                    message: "Invalid post id"
                });
            }

            const post = await posts.findOne({
                where: {
                    id: postId
                }
            });

            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            if (post.image) {
                try {
                    await fs.unlink(`public/media/${post.image}`);
                } catch (fileError) {
                    console.log("File not found on disk:", fileError.message);
                }
            }

            await post.destroy();

            return res.status(200).json({
                message: "Post deleted successfully"
            });

        } catch (e) {
            next(e);
        }
    }
}

export default postsController;