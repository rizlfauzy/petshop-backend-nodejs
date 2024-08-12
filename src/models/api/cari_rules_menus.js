const Sequelize = require("sequelize");
import sq from "../../db";

class cari_rules_menus extends Sequelize.Model { };

cari_rules_menus.init({
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
  linkdetail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  grupmenu: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  headermenu: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  iconmenu: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  icondetail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  urut_global: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  nourut: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  add: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  update: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  cancel: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  backdate: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize: sq,
  modelName: "cari_rules_menus",
  tableName: "cari_rules_menus",
  freezeTableName: true,
  timestamps: false,
})

export default cari_rules_menus;