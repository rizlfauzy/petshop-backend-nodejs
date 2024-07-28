const Sequelize = require("sequelize");
import sq from "../../db";

const barang_rusak = sq.define("barang_rusak", {
  nomor: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  tanggal: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  keterangan: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  batal: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  keteranganbatal: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  tglbatal: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  tglsimpan: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  tglupdate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  pemakai: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "IT",
  },
  is_approved: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  freezeTableName: true,
  timestamps: false,
})

export default barang_rusak;