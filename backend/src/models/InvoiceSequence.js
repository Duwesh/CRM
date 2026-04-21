import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const InvoiceSequence = sequelize.define(
  "InvoiceSequence",
  {
    firm_id: { type: DataTypes.BIGINT, primaryKey: true },
    last_number: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: "Tbl_InvoiceSequences", timestamps: false },
);

export default InvoiceSequence;
