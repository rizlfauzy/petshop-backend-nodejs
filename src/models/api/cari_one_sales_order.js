const Sequelize = require("sequelize");
import sq from "../../db";

class cari_one_sales_order extends Sequelize.Model { }

cari_one_sales_order.init({
  nomor: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  tanggal: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  keterangan: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  batal: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  keteranganbatal: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  tglbatal: {
    type: Sequelize.DATE,
    allowNull: true,
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
  pemakai: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "IT",
  },
}, {
  sequelize: sq,
  modelName: "cari_one_sales_order",
  tableName: "cari_one_sales_order",
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeFind: options => {
      options.attributes = [
        "nomor",
        "tanggal",
        "keterangan",
        "batal",
        "keteranganbatal",
        "tglbatal",
        "tglsimpan",
        "tglupdate",
        "pemakai",
      ];
    },
  },
});

export default cari_one_sales_order;