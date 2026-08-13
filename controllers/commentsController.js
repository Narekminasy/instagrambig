import Comments from "../models/comments.js";

const commentsController = {

    async createMessage(req, res, next) {
        try {
            const userId = req.user.id;

            const { postId, message } = req.body;

            if (!postId || !message) {
                return res.status(400).json({
                    message: "postId and message are required"
                });
            }

            const comment = await Comments.create({
                userId,
                postId,
                message,
            });

            return res.json({
                comment,
                message: "comment added",
            });

        } catch (e) {
            next(e);
        }
    },
    async deleteMessage(req, res, next) {
        try {
            const userId = req.user.id;

            const {id} = req.params;

            const comment = await Comments.findOne({
                where: {
                    id: id,
                    user_id: userId
                }
            });
            if (!comment) {
                return res.status(404).json({
                    message: "Comment not found or you are not authorized to delete it"
                });
            }
            await comment.destroy();

            return res.json({
                message: "Comment deleted successfully",
            });
        } catch (e) {
            next(e);
        }
    }
}

export default commentsController;