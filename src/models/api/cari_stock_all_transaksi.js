const Sequelize = require("sequelize");
import sq from "../../db";

class cari_stock_all_transaksi extends Sequelize.Model { }

cari_stock_all_transaksi.init(
  {
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
    keterangan: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sub_keterangan: {
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
    qty_masuk: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    qty_keluar: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
  },
  {
    sequelize: sq,
    modelName: "cari_stock_all_transaksi",
    tableName: "cari_stock_all_transaksi",
    freezeTableName: true,
    timestamps: false,
  }
);

export default cari_stock_all_transaksi;