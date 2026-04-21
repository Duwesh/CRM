import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ClientService = sequelize.define(
  "ClientService",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    client_id: { type: DataTypes.BIGINT, allowNull: false },
    service_name: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "Tbl_ClientServices", timestamps: false },
);

export default ClientService;
