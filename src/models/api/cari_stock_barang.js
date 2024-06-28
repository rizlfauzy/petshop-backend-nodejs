const Sequelize = require("sequelize");
import sq from "../../db";

class cari_stock_barang extends Sequelize.Model {}

cari_stock_barang.init(
  {
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
    nama_satuan: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    nama_kategori: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    stock: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
  },
  {
    sequelize: sq,
    modelName: "cari_stock_barang",
    tableName: "cari_stock_barang",
    freezeTableName: true,
    timestamps: false,
  }
);

export default cari_stock_barang;