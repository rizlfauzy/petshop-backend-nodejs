const Sequelize = require("sequelize");
import sq from "../../db";

const oto_report = sq.define("oto_report", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  grup: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  report: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  periode: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  barang: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  pdf: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  pemakai: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'IT'
  },
  tglsimpan: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  aktif: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  freezeTableName: true,
  timestamps: false,
})

export default oto_report;