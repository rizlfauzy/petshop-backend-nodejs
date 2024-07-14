const Sequelize = require("sequelize");
import sq from "../../db";

class cari_oto_report extends Sequelize.Model { }

cari_oto_report.init({
  grup: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  report: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nama: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pos: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  barang: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  periode: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  pdf: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  aktif: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize: sq,
  modelName: "cari_oto_report",
  tableName: "cari_oto_report",
  freezeTableName: true,
  timestamps: false,
});

export default cari_oto_report;