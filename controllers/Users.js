import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";
import Confirm from "../models/confirm.js";



import {
    findByEmail,
    create,
    checkEmailUnique,
    updatePassword,
    updatePhoto
} from "../controllers/authController.js";
import posts from "../models/posts.js";

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
        try {

            const {
                name,
                email,
                password,
                age,
            } = req.body;


            const emailExists = await checkEmailUnique(email);

            if (emailExists) {
                return next(
                    HttpErrors(422, "Email is already in use!")
                );
            }


            const user = await create({
                name,
                email,
                age,
                password: Users.hashPassword(password),
            });

            const userResponse = { ...user };

            delete userResponse.password;


            res.json({
                message: "Successfully registered",
                user: userResponse,
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
    }
};