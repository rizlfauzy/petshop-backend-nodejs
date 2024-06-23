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
    },
    grup: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    aktif: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    alasan_non_aktif: {
      type: Sequelize.STRING,
      allowNull: false,
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
  }
);

export default login;
