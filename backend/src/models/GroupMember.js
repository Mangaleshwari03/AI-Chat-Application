import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const GroupMember = sequelize.define(
  "GroupMember",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "member"),
      defaultValue: "member",
    },
  },
  {
    timestamps: true,
    tableName: "group_members",
  }
);

export default GroupMember;
