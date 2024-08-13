const Sequelize = require("sequelize");
import sq from "../../db";

const barang = sq.define(
  "barang",
  {
    barcode: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nama: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    satuan: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    kategori: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    min_stock: {
      type: Sequelize.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    disc: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    harga_jual: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    harga_modal: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    keterangan: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    aktif: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    pemakai: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "IT",
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
    repack: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    barang_induk: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
    },
    qty_repack: {
      type: Sequelize.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default barang;