import jwt from "jsonwebtoken";
import sq from "../../db.js";
import login from "../../models/api/login_model.js";
import hist_login from "../../models/hist/hist_login_model.js";
import konfigurasi from "../../models/api/konfigurasi_model.js";
import moment from "moment";
require("dotenv").config();
const Sequelize = require("sequelize");
const { JWT_SECRET_KEY } = process.env;

const auth_cont = {
  login: async (req, res) => {
    const trans = await sq.transaction();
    try {
      const { username } = req.body;

      const user = await login.findOne({ where: { username: username.toUpperCase() } }, { transaction: trans });
      const konf = await konfigurasi.findOne({ where: { kodetoko: user.kodetoko } }, { transaction: trans });
      const token = jwt.sign(
        {
          myusername: username,
          mygrup: user.grup,
          mycabang: user.kodetoko,
          tglawal_periode: konf.tglawal,
          tglakhir_periode: konf.tglakhir,
          kodeharga: konf.kodeharga,
          toko_bb: konf.toko_bb,
        },
        JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      await hist_login.create(
        {
          token,
          pemakai: username,
          tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        { transaction: trans }
      );

      await trans.commit();

      return res.status(200).json({
        message: "Berhasil masuk ke halaman utama",
        error: false,
        token,
      });
    } catch (e) {
      await trans.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { username } = req.query;
      const data = await sq.query(`SELECT * FROM cari_user where username = :username`, { replacements: { username: username.toUpperCase() }, type: Sequelize.QueryTypes.SELECT, transaction });
      const password = data[0] ? decodeURIComponent(atob(data[0].password)) : '';
      await transaction.commit();
      return res.status(200).json({ data: {...data[0], password} || {}, error: false, message: "Data berhasil diambil" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  register: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { username, password, kode_grup: grup } = req.body;
      const enc_pass = encodeURIComponent(btoa(password));
      await login.create({ username: username.toUpperCase(), password: enc_pass, grup, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { transaction });
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil disimpan" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { username, password, kode_grup: grup, aktif } = req.body;
      const enc_pass = encodeURIComponent(btoa(password));
      await login.update({ password: enc_pass, pemakai: req.user.myusername.toUpperCase(), grup, aktif }, { where: { username: username.toUpperCase() }, transaction });
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil diubah" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  logout: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { token } = req.body;
      await hist_login.destroy({ where: { token } }, { transaction });
      req.user = null;
      await transaction.commit();
      return res.status(200).json({ message: "Berhasil keluar dari sistem", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default auth_cont;