const Sequelize = require("sequelize");
import sq from "../../db";

class cari_one_barang_rusak extends Sequelize.Model { }

cari_one_barang_rusak.init({
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
  sequelize: sq,
  modelName: "cari_one_barang_rusak",
  tableName: "cari_one_barang_rusak",
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeFind: options => {
      options.attributes = [
        "nomor",
        "tanggal",
        "keterangan",
        "batal",
        "keteranganbatal",
        "tglbatal",
        "tglsimpan",
        "tglupdate",
        "pemakai",
        "is_approved",
      ];
    },
  },
});

export default cari_one_barang_rusak;