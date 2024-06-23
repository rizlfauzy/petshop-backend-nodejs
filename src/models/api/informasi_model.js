const Sequelize = require("sequelize");
import sq from "../../db";

const informasi = sq.define(
  "informasi",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    info: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pemakai: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tglsimpan: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    tglupdate: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default informasi;
