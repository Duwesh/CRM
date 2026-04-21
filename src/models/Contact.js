import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Contact = sequelize.define(
  "Contact",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    client_id: { type: DataTypes.BIGINT, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    designation: DataTypes.STRING,
    department: DataTypes.STRING,
    mobile: DataTypes.STRING,
    email: DataTypes.STRING,
    whatsapp_number: DataTypes.STRING,
    birthday: DataTypes.DATEONLY,
    notes: DataTypes.TEXT,
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Contacts" },
);

export default Contact;
