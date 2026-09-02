import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";
import Confirm from "../models/confirm.js";
import { sendVerificationCode } from "../services/mail.service.js";
import moment from "moment";




import {
    findByEmail,
    create,
    checkEmailUnique,
    updatePassword,
    updatePhoto
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
            // console.log(req.files);
            // console.log(req.body);

            const userId = req.user.id;

            const { firstname, lastname, address, phone} = req.body;

            const existingConfirm = await Confirm.findOne({
                where: {
                    userId,
                }
            });

            if (existingConfirm) {
                return res.status(409).json({
                    message: "User already confirmed!"
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

            return res.status(201).json({
                confirm,
                message: "confirm already send"
            });
        }catch (e){
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
    }

};

