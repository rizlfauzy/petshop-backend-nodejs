const Sequelize = require("sequelize");
import sq from "../../db";
import moment from "moment";

const kategori = sq.define("kategori", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  kode: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
  },
  nama: {
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
    defaultValue: moment().format("YYYY-MM-DD HH:mm:ss"),
  },
  tglupdate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
}, {
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeCreate: (instance) => {
      instance.nama = instance.nama.toUpperCase();
      instance.kode = instance.kode.toUpperCase();
      instance.pemakai = instance.pemakai.toUpperCase();
    },
    beforeUpdate: (instance) => {
      instance.nama = instance.nama.toUpperCase();
      instance.pemakai = instance.pemakai.toUpperCase();
    },
  },
});

sq.sync();

export default kategori;