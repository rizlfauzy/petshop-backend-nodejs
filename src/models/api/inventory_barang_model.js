const Sequelize = require("sequelize");
import sq from "../../db";

const inventory_barang = sq.define(
  "inventory_barang",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    periode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    barcode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    qty_awal: {
      type: Sequelize.NUMBER,
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
    pemakai: {
      type: Sequelize.STRING,
      allowNull: false,
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
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

sq.sync();

export default inventory_barang;