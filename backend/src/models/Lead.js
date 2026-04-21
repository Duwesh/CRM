import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Lead = sequelize.define(
  "Lead",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_person: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    services_interest: DataTypes.TEXT,
    estimated_value: DataTypes.DECIMAL(12, 2),
    stage: {
      type: DataTypes.STRING,
      defaultValue: "new",
    },
    source: DataTypes.STRING,
    referred_by: DataTypes.STRING,
    notes: DataTypes.TEXT,
    followup_date: DataTypes.DATEONLY,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Tbl_Leads",
  },
);

export default Lead;
