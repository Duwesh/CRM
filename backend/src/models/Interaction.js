import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Interaction = sequelize.define(
  "Interaction",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    client_id: { type: DataTypes.BIGINT, allowNull: false },
    firm_id: { type: DataTypes.BIGINT, allowNull: false },
    team_member_id: DataTypes.BIGINT,
    contact_name: DataTypes.STRING,
    interaction_type: DataTypes.STRING,
    interaction_date: { type: DataTypes.DATEONLY, allowNull: false },
    summary: DataTypes.TEXT,
    followup_date: DataTypes.DATEONLY,
    action_required: DataTypes.TEXT,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName: "Tbl_Interactions" },
);

export default Interaction;
