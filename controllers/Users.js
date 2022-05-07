import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";

import {
    findByEmail,
    create,
    checkEmailUnique,
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


};