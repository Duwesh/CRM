import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Firm = sequelize.define(
  "Firm",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: DataTypes.STRING,
    reg_number: DataTypes.STRING,
    address: DataTypes.TEXT,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    logo_url: DataTypes.TEXT,
  },
  {
    tableName: "Tbl_Firms",
  },
);

export default Firm;
