const Sequelize = require("sequelize");
import sq from "../../db.js";

const login = sq.define(
  "login",
  {
    username: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    kodetoko: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "S000"
    },
    grup: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    aktif: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    alasan_non_aktif: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tgl_non_aktif: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    pemakai: {
      type: Sequelize.STRING,
      allowNull: false,
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
      beforeCreate: (data) => {
        data.username = data.username.toUpperCase();
        data.kodetoko = data.kodetoko.toUpperCase();
        data.grup = data.grup.toUpperCase();
        data.pemakai = data.pemakai.toUpperCase();
      },
      beforeUpdate: (data) => {
        data.username = data.username.toUpperCase();
        data.kodetoko = data.kodetoko.toUpperCase();
        data.grup = data.grup.toUpperCase();
        data.pemakai = data.pemakai.toUpperCase();
      },
    },
  }
);

export default login;
