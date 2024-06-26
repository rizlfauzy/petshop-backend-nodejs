const Sequelize = require("sequelize");
import sq from "../../db";
import grup from "./grup_model";


const menu = sq.define(
  "menu",
  {
    nomenu: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    namamenu: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    linkmenu: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    grupmenu: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    nourut: {
      type: Sequelize.NUMBER,
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
    urut_global: {
      type: Sequelize.NUMBER,
      allowNull: false,
    },
    iconmenu: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    linkdetail: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    headermenu: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    icondetail: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default menu;