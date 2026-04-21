import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Invoice = sequelize.define(
  "Invoice",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    client_id: { type: DataTypes.BIGINT, allowNull: false },
    firm_id: { type: DataTypes.BIGINT, allowNull: false },
    invoice_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT,
    invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
    due_date: DataTypes.DATEONLY,
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    gst_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    amount_received: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: "unpaid" },
    pdf_url: DataTypes.TEXT,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Invoices" },
);

export default Invoice;
