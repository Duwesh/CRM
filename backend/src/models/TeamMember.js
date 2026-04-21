import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const TeamMember = sequelize.define(
  "TeamMember",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    firm_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    specialization: DataTypes.STRING,
    join_date: DataTypes.DATEONLY,
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Tbl_TeamMembers",
  },
);

export default TeamMember;
