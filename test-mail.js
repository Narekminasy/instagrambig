require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendTest() {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: "narekminasyan52@gmail.com",
            subject: "hello brovoo",
            text: "Backend already usee",
        });
        console.log("ok", info.messageId);
    } catch (error) {
        console.error("error", error);
    }
}

sendTest();
