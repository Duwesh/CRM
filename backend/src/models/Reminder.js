import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Reminder = sequelize.define(
  "Reminder",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    firm_id: { type: DataTypes.BIGINT, allowNull: false },
    client_id: DataTypes.BIGINT,
    assigned_to: DataTypes.BIGINT,
    reminder_text: { type: DataTypes.TEXT, allowNull: false },
    reminder_date: { type: DataTypes.DATEONLY, allowNull: false },
    priority: { type: DataTypes.STRING, defaultValue: "medium" },
    is_done: { type: DataTypes.BOOLEAN, defaultValue: false },
    email_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Reminders" },
);

export default Reminder;
