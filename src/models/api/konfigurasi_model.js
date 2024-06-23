const Sequelize = require("sequelize");
import sq from "../../db";

const konfigurasi = sq.define("konfigurasi", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  kodeharga: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tglawal: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  tglakhir: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  toko_bb: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  kodetoko: {
    type: Sequelize.STRING,
    allowNull: false,
  }
}, {
  freezeTableName: true,
  timestamps: false,
})

export default konfigurasi;