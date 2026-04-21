import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const InviteToken = sequelize.define(
  "InviteToken",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    firm_id: { type: DataTypes.BIGINT, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used_at: DataTypes.DATE,
  },
  { tableName: "Tbl_InviteTokens" },
);

export default InviteToken;
