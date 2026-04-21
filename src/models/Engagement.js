import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Engagement = sequelize.define(
  "Engagement",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    client_id: { type: DataTypes.BIGINT, allowNull: false },
    assigned_to: DataTypes.BIGINT,
    title: { type: DataTypes.STRING, allowNull: false },
    type: DataTypes.STRING,
    period: DataTypes.STRING,
    deadline: DataTypes.DATEONLY,
    fees: DataTypes.DECIMAL(12, 2),
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    notes: DataTypes.TEXT,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Engagements" },
);

export default Engagement;
