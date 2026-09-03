import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";
import Confirm from "../models/confirm.js";
import { sendVerificationCode } from "../services/mail.service.js";
import moment from "moment";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

import {
    findByEmail,
    create,
    checkEmailUnique,
    updatePassword,
    updatePhoto,
    Adminmake,
} from "../controllers/authController.js";


const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
}


export const controller = {

    async profile(req, res, next) {
        try {
            res.json({
                message: "Welcome to your profile",
                user: req.user,
            });
        } catch (e) {
            next(e);
        }
    },


    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await findByEmail(email);

            if (!user || user.password !== Users.hashPassword(password)) {
                return next(
                    HttpErrors(401, "Invalid email or password")
                );
            }

            if (!user.is_verified) {
                return next(
                    HttpErrors(403, "Your email is not verified. Please verify it using the code sent to your Gmail.")
                );
            }


            const token = jwt.sign(
                {
                    userId: user.id,
                    role: user.role,
                },
                JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            );


            res.cookie("usertoken", token, {
                httpOnly: true,
                signed: true,
                path: "/",
                maxAge: 1000 * 60 * 60 * 24,
            });


            const userResponse = { ...user };
            delete userResponse.password;


            res.json({
                message: "Login successfully",
                token,
                user: userResponse,
            });


        } catch (e) {
            next(e);
        }
    },

    async register(req, res, next) {
        console.log("--> POST /users/register հարցումը ՀԱՍԱՎ ԲԵՔԵՆԴ!", req.body);
        try {
            const { name, email, password, age } = req.body;

            const emailExists = await checkEmailUnique(email);
            if (emailExists) {
                return next(
                    HttpErrors(422, "Email is already in use!")
                );
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            const expiresAt = moment().add(15, "minutes").toDate();

            sendVerificationCode(email, name, otpCode).catch(mailError => {
                console.error("Message send your Gmail", mailError.message);
            });

            const user = await Users.create({
                name,
                email,
                age,
                password: Users.hashPassword(password),
                verification_code: otpCode,
                code_expires_at: expiresAt,
                is_verified: false,
            });

            const userResponse = JSON.parse(JSON.stringify(user));
            delete userResponse.password;

            res.json({
                success: true,
                message: "Successfully registered",
                user: userResponse,
            });

        } catch (e) {
            next(e);
        }
    },

    async verifyCode(req, res, next) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return next(HttpErrors(400, "Email and verification code are required."));
            }

            const user = await findByEmail(email);
            if (!user) {
                return next(HttpErrors(404, "User not found."));
            }

            if (String(user.verification_code).trim() !== String(code).trim()) {
                return next(HttpErrors(400, "Invalid verification code."));
            }
            await Users.update(
                {
                    is_verified: true,
                    verification_code: null,
                    code_expires_at: null
                },
                {
                    where: { id: user.id }
                }
            );

            res.json({
                success: true,
                message: "Email verified successfully! You can now log in.",
            });

        } catch (e) {
            next(e);
        }
    },


    async logout(req, res, next) {
        try {

            res.clearCookie("usertoken", {
                path: "/",
            });


            return res.json({
                success: true,
                message: "Logged out successfully",
            });

        } catch (e) {
            next(e);
        }
    },

    async forgotPassword(req, res, next) {
        try {
            const { email, newPassword } = req.body;

            if (!email || !newPassword) {
                return next(HttpErrors(400, "Email and new password are required"));
            }

            const user = await findByEmail(email);
            if (!user) {
                return next(HttpErrors(404, "User not found"));
            }

            const hashedPassword = Users.hashPassword(newPassword);

            const isUpdated = await updatePassword(user.id, hashedPassword);

            if (!isUpdated) {
                return next(HttpErrors(500, "Failed to update password"));
            }

            return res.json({ success: true, message: "Password updated successfully" });
        } catch (e) {
            next(e);
        }
    },
    async getConfirm(req, res, next) {
        try {
            const userId = req.user.id;

            const currentUser = await Users.findByPk(userId);

            if (!currentUser) {
                return res.status(404).json({ message: "User not found." });
            }

            // const UserRole = req.user.role;
            //
            // // if (UserRole !== 'admin') {
            // //     return res.status(403).json({
            // //         message: "Only Admin can ."
            // //     });
            // // }
            // console.log(UserRole)

            const { firstname, lastname, address, phone } = req.body;

            const existingConfirm = await Confirm.findOne({
                where: { userId }
            });

            if (existingConfirm) {
                return res.status(409).json({
                    message: "User already confirmed!"
                });
            }

            if (!req.files || req.files.length < 3) {
                return res.status(400).json({
                    message: "Please upload all 3 required photos (Profile, Background, Diploma)."
                });
            }

            const [photo, background, medicalDiploma] = req.files;


            const confirm = await Confirm.create({
                userId,
                firstname,
                lastname,
                address,
                phone,
                photo: photo.filename,
                background: background.filename,
                medicalDiploma: medicalDiploma.filename,
            });

            const attachments = [
                { filename: photo.originalname, path: photo.path },
                { filename: background.originalname, path: background.path },
                { filename: medicalDiploma.originalname, path: medicalDiploma.path }
            ];

            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                to: 'narekminasyan52@gmail.com',
                subject: `New Doctor Verification: ${firstname} ${lastname}`,
                html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333;">New Verification Request Received</h2>
                    <hr>
                    <p><b>Applicant Name:</b> ${firstname} ${lastname}</p>
                    <p><b>Applicant User ID:</b> ${userId}</p>
                    <p><b>Address:</b> ${address}</p>
                    <p><b>Phone:</b> ${phone}</p>
                    <br>
                    <p style="color: #666; font-style: italic;">The submitted profile photo, background, and medical diploma are attached to this email.</p>
                </div>
            `,
                attachments: attachments
            };

            await transporter.sendMail(mailOptions);

            return res.status(201).json({
                confirm,
                message: "confirm already send"
            });

        } catch (e) {
            next(e);
        }
    },


    async getAllUsers(req, res, next) {
        try {
            const allUsers = await Confirm.findAll({
                include: [
                    {
                        model: Users,
                        attributes: ['id', 'email'],
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.json({
                users: allUsers,
                message: "All users retrieved successfully"
            });

        } catch (e) {
            next(e);
        }
    },

    async getAllprofile(req, res, next) {
        try {
            const allUsersProfile = await Confirm.findAll({
                attributes: ['photo'],
                order: [['createdAt', 'DESC']]
            });

            return res.json({
                users: allUsersProfile,
                message: "All users retrieved successfully"
            });

        } catch (e) {
            next(e);
        }
    },

    async updatePhotos(req, res, next) {
        try {
            const userId = req.user.id;

            const files = req.files;

            if (!files || files.length === 0) {
                return next(HttpErrors(400, "Photo or background is required"));
            }

            const photo = files[0]?.filename || null;
            const background = files[1]?.filename || null;

            const updated = await updatePhoto(
                userId,
                photo,
                background
            );

            if (!updated) {
                return next(HttpErrors(404, "User not found or photos not updated"));
            }

            return res.json({
                message: "Photo and background updated successfully"
            });

        } catch (e) {
            next(e);
        }
    },

    async deleteUser(req, res, next) {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(401).json({ success: false, message: "User session not found." });
            }

            const foundUser = await Users.findByPk(userId);
            const deletedCount = await Users.destroy({
                where: { id: userId }
            });

            if (deletedCount === 0) {
                return res.status(404).json({ success: false, message: "Message not found or already deleted" });
            }

            if (req.session) {
                req.session.destroy();
            }

            return res.status(200).json({
                success: true,
                message: "Account deleted successfully"
            });

        } catch (err) {
            console.error("Backend Error:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    async getAdminUser(req, res, next) {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(401).json({ success: false, message: "User session not found." });
            }

            const currentUserRole = req.user.dataValues ? req.user.dataValues.role : req.user.role;
            if (currentUserRole !== 'adminGeneral') {
                return res.status(403).json({ success: false, message: "Access denied. Only admins can perform this action." });
            }

            const targetUserId = req.params.id;

            const success = await Adminmake(targetUserId);

            if (!success) {
                return res.status(400).json({ success: false, message: "Failed to update user role or user not found." });
            }

            return res.status(200).json({
                success: true,
                message: "User has been successfully promoted to admin."
            });

        } catch (err) {
            console.error("Backend Error:", err);
            next(err);
        }
    },

    async deleteUserAdmin(req, res, next) {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(401).json({ success: false, message: "User session not found." });
            }

            const currentUserRole = req.user.dataValues ? req.user.dataValues.role : req.user.role;
            if (currentUserRole !== 'adminGeneral') {
                return res.status(403).json({ success: false, message: "Access denied. Only adminGeneral can perform this action." });
            }

            const targetUserId = req.params.id;

            await Confirm.destroy({
                where: { userId: targetUserId }
            });

            const deletedRows = await Users.destroy({
                where: { id: targetUserId }
            });

            if (deletedRows === 0) {
                return res.status(444).json({ success: false, message: "User not found or already deleted." });
            }

            return res.status(200).json({
                success: true,
                message: "User account has been permanently deleted."
            });

        } catch (err) {
            console.error("Backend Error:", err);
            next(err);
        }
    }

};

