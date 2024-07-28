const Sequelize = require("sequelize");
import sq from "../../db";

class cari_repack_barang extends Sequelize.Model { }

cari_repack_barang.init({
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
  barcode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tanggal: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  nama_barang: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  stock: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  qty: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  jenis: {
    type: Sequelize.STRING,
    allowNull: false
  },
  qty_repack: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
}, {
  sequelize: sq,
  modelName: "cari_repack_barang",
  tableName: "cari_repack_barang",
  freezeTableName: true,
  timestamps: false,
});

export default cari_repack_barang;