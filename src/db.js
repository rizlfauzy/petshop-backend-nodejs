const { Sequelize } = require("sequelize");
require("dotenv").config();

const { DB_NAME, DB_HOST, DB_PASS, DB_PORT, DB_USER } = process.env;

const sq = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "postgres",
  logging: false,
  port: DB_PORT
});

export default sq;
