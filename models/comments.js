import {DataTypes} from 'sequelize';
import sequelize from "../clients/db.sequelize.js";

const Comments = sequelize.define("comments", {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    message:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},{
    underscored: true
})

export default Comments