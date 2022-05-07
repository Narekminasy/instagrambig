import Messages from '../models/messages.js'; // Ուղղված է տառասխալը

const messagesController = {
    async sendMessage(req, res, next) {
        try {
            const userId = req.user.id;
            const sendId = req.params.sendId;

            const textMessage = req.body.message;

            if (!textMessage || textMessage.trim() === "") {
                return res.status(400).send({
                    error: 'write message',
                });
            }

            const newMessage = await Messages.create({
                userId: userId,
                sendId: sendId,
                message: textMessage
            });

            return res.json({
                message: newMessage,
                add: 'Message sent and Deplome sent'
            });
        } catch (e) {
            next(e);
        }
    },

    async deleteMessage(req, res, next) {
        try {
            const userId = req.user.id;
            const messageId = req.params.id;

            if (!messageId) {
                return res.status(400).json({
                    error: 'Message ID is required'
                });
            }

            const message = await Messages.findOne({
                where: {
                    id: messageId,
                    userId: userId
                }
            });

            if (!message) {
                return res.status(404).json({
                    message: 'Message not found or already deleted'
                });
            }

            await message.destroy();

            return res.json({
                deletedMessageId: messageId,
                add: 'Message deleted successfully'
            });
        } catch (e) {
            next(e);
        }
    }

}

export default messagesController;
