import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PasswordResetToken = sequelize.define(
  "PasswordResetToken",
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true },
    token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    expires_at: { type: DataTypes.DATE, allowNull: false },
  },
  { tableName: "Tbl_PasswordResetTokens" },
);

export default PasswordResetToken;
