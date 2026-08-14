import { DataTypes } from 'sequelize';
import sequelize from "../clients/db.sequelize.js";

const Messages = sequelize.define("messages", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    sendId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
}, {
    underscored: true
});

export default Messages;
