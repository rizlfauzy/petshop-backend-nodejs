const Sequelize = require("sequelize");
import sq from "../../db";

const so_barang = sq.define("so_barang", {
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
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  harga: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  disc: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  nilai_disc: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  total: {
    type: Sequelize.INTEGER,
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
}, {
  freezeTableName: true,
  timestamps: false,
})

export default so_barang;