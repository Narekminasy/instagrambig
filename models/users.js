import CryptoJS from "crypto-js";
import { DataTypes, Model } from "sequelize";
import db from "../clients/db.sequelize.js";

const { PASSWORD_SECRET } = process.env;

if (!PASSWORD_SECRET) {
    throw new Error("PASSWORD_SECRET is missing");
}

class Users extends Model {
    static hashPassword(password) {
        return CryptoJS.HmacSHA256(
            password,
            PASSWORD_SECRET
        ).toString(CryptoJS.enc.Hex);
    }
}

Users.init(
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        age: {
            type: DataTypes.INTEGER,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verification_code: {
            type: DataTypes.STRING(6),
            allowNull: true
        },
        code_expires_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "user",
        },
    },
    {
        sequelize: db,
        modelName: "users",
        tableName: "users",
        timestamps: false,
    }
);

export default Users;