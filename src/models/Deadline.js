import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Deadline = sequelize.define(
  "Deadline",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    firm_id: { type: DataTypes.BIGINT, allowNull: false },
    client_id: DataTypes.BIGINT,
    title: { type: DataTypes.STRING, allowNull: false },
    category: DataTypes.STRING,
    due_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    notes: DataTypes.TEXT,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Deadlines" },
);

export default Deadline;
