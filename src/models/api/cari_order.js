const Sequelize = require("sequelize");
import sq from "../../db";

class cari_pembelian extends Sequelize.Model { }

cari_pembelian.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nomor: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tanggal: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  barcode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nama_barang: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  qty: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  harga: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  total: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
}, {
  sequelize: sq,
  modelName: "cari_pembelian",
  tableName: "cari_pembelian",
  freezeTableName: true,
  timestamps: false,
})

export default cari_pembelian;