import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Document = sequelize.define(
  "Document",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    client_id: { type: DataTypes.BIGINT, allowNull: false },
    uploaded_by: DataTypes.BIGINT,
    name: { type: DataTypes.STRING, allowNull: false },
    file_url: { type: DataTypes.TEXT, allowNull: false },
    file_type: DataTypes.STRING,
    category: DataTypes.STRING,
    file_size_kb: DataTypes.INTEGER,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Documents" },
);

export default Document;
