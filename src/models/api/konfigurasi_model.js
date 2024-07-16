const Sequelize = require("sequelize");
import sq from "../../db";

const konfigurasi = sq.define("konfigurasi", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  tglawal: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  tglakhir: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  kodetoko: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tglupdate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
}, {
  freezeTableName: true,
  timestamps: false,
})

export default konfigurasi;