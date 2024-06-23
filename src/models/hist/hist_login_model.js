const Sequelize = require("sequelize");
import sq from "../../db";

const hist_login = sq.define(
  "hist_login",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
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

export default hist_login;
