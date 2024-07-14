const Sequelize = require("sequelize");
import sq from "../../db";

const report = sq.define("report", {
  report: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  nama: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  aktif: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  pemakai: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "IT",
  },
  pos: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  tglsimpan: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
}, {
  freezeTableName: true,
  timestamps: false,
})

export default report;