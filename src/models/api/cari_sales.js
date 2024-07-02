const Sequelize = require("sequelize");
import sq from "../../db";

class cari_sales extends Sequelize.Model { }

cari_sales.init({
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
  stock: {
    type: Sequelize.NUMBER,
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
  disc: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  nilai_disc: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  total: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
}, {
  sequelize: sq,
  modelName: "cari_penjualan",
  tableName: "cari_penjualan",
  freezeTableName: true,
  timestamps: false,
});

export default cari_sales;