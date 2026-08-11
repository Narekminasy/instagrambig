import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";
import Confirm from "../models/confirm.js";

import {
    findByEmail,
    create,
    checkEmailUnique,
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

    async getConfirm(req, res, next) {
        try {
            // console.log(req.files);
            // console.log(req.body);

            const userId = req.user.id; // 'req.user.userId'-ի փոխարեն

            const { firstname, lastname} = req.body;

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
                photo: photo.filename,
                background: background.filename,
                medicalDiploma: medicalDiploma.filename,
            });

            return res.status(201).json({
                confirm,
                message: "confirm successfully"
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
    }

};