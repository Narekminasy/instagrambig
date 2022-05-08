import { DataTypes } from "sequelize";
import sequelize from "../clients/db.sequelize.js";

const Confirm = sequelize.define(
    "confirm",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        photo: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        background: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        medicalDiploma: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        underscored: true,
    }
);

export default Confirm;