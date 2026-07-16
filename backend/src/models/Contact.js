import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

const Contact = sequelize.define(
  "Contact",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "contacts",
  }
);

export default Contact;
