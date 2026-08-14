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
                add: 'Message sent'
            });
        } catch (e) {
            next(e);
        }
    }
}

export default messagesController;
