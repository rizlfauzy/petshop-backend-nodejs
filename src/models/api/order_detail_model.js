const Sequelize = require("sequelize");
import sq from "../../db";

const order_detail = sq.define(
  "pembelian_detail",
  {
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
    tglsimpan: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    pemakai: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "IT",
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default order_detail;