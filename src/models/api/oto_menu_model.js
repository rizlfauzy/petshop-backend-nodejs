const Sequelize = require("sequelize");
import sq from "../../db";

const oto_menu = sq.define("oto_menu", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  grup: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nomenu: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  open: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  accept: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  backdate: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  aktif: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  pemakai: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'IT'
  },
  tglsimpan: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
},{
  freezeTableName: true,
  timestamps: false,
});

export default oto_menu;