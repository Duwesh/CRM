import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Task = sequelize.define(
  "Task",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    client_id: DataTypes.BIGINT,
    assigned_to: DataTypes.BIGINT,
    engagement_id: DataTypes.BIGINT,
    firm_id: { type: DataTypes.BIGINT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    due_date: DataTypes.DATEONLY,
    priority: { type: DataTypes.STRING, defaultValue: "medium" },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    notes: DataTypes.TEXT,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Tasks" },
);


export default Task;
