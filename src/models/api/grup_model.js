const Sequelize = require("sequelize");
import sq from "../../db";

const grup = sq.define(
  "grup",
  {
    kode: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nama: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_pusat: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    is_edit_harga: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
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
    },
  },
  {
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
  }
);

export default grup;
