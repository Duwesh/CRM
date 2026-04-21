import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    firm_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    manager_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "Tbl_TeamMembers",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: DataTypes.STRING,
    pan: DataTypes.STRING,
    gstin: DataTypes.STRING,
    cin: DataTypes.STRING,
    industry: DataTypes.STRING,
    constitution: DataTypes.STRING,
    services_availed: DataTypes.TEXT, // Storing as JSON string or comma-separated
    registered_address: DataTypes.TEXT,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    it_password: DataTypes.STRING,
    gst_password: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
    source: DataTypes.STRING,
    since_year: DataTypes.INTEGER,
    annual_fee: DataTypes.DECIMAL(12, 2),
    notes: DataTypes.TEXT,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Tbl_Clients",
  },
);

export default Client;
