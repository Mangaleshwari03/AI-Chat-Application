import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Group = sequelize.define(
  "Group",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupPic: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    isStudyCircle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "groups",
  }
);

export default Group;
