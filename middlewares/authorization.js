import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";

const { JWT_SECRET } = process.env;

export default async (req, res, next) => {
    try {
        const token =
            req.signedCookies?.usertoken ||
            req.cookies?.usertoken;

        if (!token) {
            return res.redirect("/users/login");
        }

        let decoded;

        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            res.clearCookie("usertoken");
            return res.redirect("/users/login");
        }

        const user = await Users.findByPk(decoded.userId);

        if (!user) {
            res.clearCookie("usertoken");
            return res.redirect("/users/login");
        }

        req.user = user;
        console.log(decoded);

        next();
    } catch (error) {
        next(HttpErrors(500, error.message));
    }
};