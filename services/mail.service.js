import "dotenv/config";
import { Resend } from "resend";

const getResendInstance = () => {
    if (!process.env.RESEND_API_KEY) {
        console.error("CRITICAL ERROR: RESEND_API_KEY is missing in Environment Variables!");
        return null;
    }
    return new Resend(process.env.RESEND_API_KEY);
};

export const sendVerificationCode = async (email, name, code) => {
    const resend = getResendInstance();

    if (!resend) {
        console.log("⚠️ Skipping email delivery because RESEND_API_KEY is not configured.");
        return false;
    }

    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
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
        console.log(`✅ Email successfully sent to ${email} via Resend API.`);
        return true;
    } catch (error) {
        console.error("Resend API error during execution:", error);
        return false;
    }
};
