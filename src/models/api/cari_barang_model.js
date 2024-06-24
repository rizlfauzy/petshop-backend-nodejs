const Sequelize = require("sequelize");
import sq from "../../db";

class cari_barang_view extends Sequelize.Model { }

cari_barang_view.init({
  barcode: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  nama: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  kode_satuan: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nama_satuan: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  kode_kategori: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nama_kategori: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  min_stock: {
    type: Sequelize.NUMBER,
    allowNull: false,
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
  }
}, {
  sequelize: sq,
  modelName: "cari_barang",
  tableName: "cari_barang",
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeFind: (options) => {
      options.attributes = ["barcode", "nama", "kode_satuan", "nama_satuan", "kode_kategori", "nama_kategori", "min_stock", "disc", "harga_jual", "harga_modal", "keterangan", "aktif"];
    }
  }
});

export default cari_barang_view;