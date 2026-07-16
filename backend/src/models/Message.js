import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

export const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 65000],
      },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      defaultValue: "idle",
      allowNull: true,
    },
    emotion: {
      type: DataTypes.STRING,
      defaultValue: "neutral",
      allowNull: true,
    },
    isSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "messages",
  }
);

export default Message;
