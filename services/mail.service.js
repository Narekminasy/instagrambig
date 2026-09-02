import "dotenv/config"
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST || '://gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});


export const sendVerificationCode = async (email, name, code) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Email Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 500px; border-radius: 10px;">
                    <h2 style="color: #333;">Hello, ${name}!</h2>
                    <p style="font-size: 16px; color: #555;">Thank you for registering. Your email verification code is:</p>
                    <div style="font-size: 32px; font-weight: bold; color: #28a745; letter-spacing: 5px; margin: 20px 0; text-align: center; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                        ${code}
                    </div>
                    <p style="font-size: 12px; color: #888;">This code is valid for 15 minutes. If you did not request this code, please ignore this email.</p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error("Mail service error:", error);
        throw new Error("Failed to send email. The email address might not exist.");
    }
};
