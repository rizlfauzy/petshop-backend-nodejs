const Sequelize = require("sequelize");
import sq from "../../db";

class cari_stock_real_barang extends Sequelize.Model { }

cari_stock_real_barang.init({
  periode: {
    type: Sequelize.STRING,
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
  awal: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  masuk: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  keluar: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  nama_satuan: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  qty_repack: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  barang_induk: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  aktif: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
}, {
  sequelize: sq,
  modelName: "cari_stock_real_barang",
  tableName: "cari_stock_real_barang",
  freezeTableName: true,
  timestamps: false,
})

export default cari_stock_real_barang;