const Sequelize = require("sequelize");
import sq from "../../db";

class cari_rules_reports extends Sequelize.Model { };

cari_rules_reports.init({
  report: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nama: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  report_url: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pos: {
    type: Sequelize.NUMBER,
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
  excel: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  aktif: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize: sq,
  modelName: "cari_rules_reports",
  tableName: "cari_rules_reports",
  freezeTableName: true,
  timestamps: false,
})

export default cari_rules_reports;