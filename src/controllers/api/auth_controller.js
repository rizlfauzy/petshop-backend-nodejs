import jwt from "jsonwebtoken";
import sq from "../../db.js";
import login from "../../models/api/login_model.js";
import hist_login from "../../models/hist/hist_login_model.js";
import konfigurasi from "../../models/api/konfigurasi_model.js";
import cari_barang_view from "../../models/api/cari_barang_model.js";
import inventory_barang from "../../models/api/inventory_barang_model.js";
import moment from "moment";
import { decrypt, encrypt } from "../../utils/encrypt.js";
import oto_menu from "../../models/api/oto_menu_model.js";
import oto_report from "../../models/api/oto_report_model.js";
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

      const goods = await cari_barang_view.findAll(
        {
          attributes: ["barcode"],
          where: {
            aktif: true,
          },
        },
        {
          transaction: trans,
        }
      );

      if (goods.length > 0) {
        for (const good of goods) {
          const stocks_now = await inventory_barang.findAll(
            {
              attributes: ["barcode", "qty_awal", "qty_masuk", "qty_keluar"],
              where: {
                periode: moment().format("YYYYMM"),
                barcode: good.barcode,
              },
            },
            {
              transaction: trans,
            }
          );
          if (stocks_now.length < 1) {
            const stocks_before = await inventory_barang.findAll(
              {
                attributes: ["barcode", "qty_awal", "qty_masuk", "qty_keluar"],
                where: {
                  periode: {
                    [Sequelize.Op.lt]: moment().format("YYYYMM"),
                  },
                  barcode: good.barcode,
                },
                order: [["periode", "desc"]],
                limit: 1,
              },
              {
                transaction: trans,
              }
            );
            if (stocks_before.length > 0) {
              await inventory_barang.create(
                {
                  barcode: good.barcode.toUpperCase(),
                  periode: moment().format("YYYYMM"),
                  qty_awal: Number(stocks_before[0].qty_awal) + Number(stocks_before[0].qty_masuk) - Number(stocks_before[0].qty_keluar),
                  qty_masuk: 0,
                  qty_keluar: 0,
                  pemakai: username.toUpperCase(),
                  tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
                },
                { transaction: trans }
              );
            } else {
              await inventory_barang.create(
                {
                  barcode: good.barcode.toUpperCase(),
                  periode: moment().format("YYYYMM"),
                  qty_awal: 0,
                  qty_masuk: 0,
                  qty_keluar: 0,
                  pemakai: username.toUpperCase(),
                  tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
                },
                {
                  transaction: trans,
                }
              );
            }
          }
        }
      }

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
      const password = data[0] ? decrypt(data[0].password) : "";
      await transaction.commit();
      return res.status(200).json({ data: { ...data[0], password } || {}, error: false, message: "Data berhasil diambil" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  register: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { username, password, kode_grup: grup } = req.body;
      const enc_pass = encrypt(password);

      await login.create({ username: username.toUpperCase(), password: enc_pass, grup, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.url == '/register' ? username.toUpperCase() : req.user.myusername.toUpperCase() }, { transaction });

      await oto_menu.destroy({ where: { grup } }, { transaction });
      await oto_menu.bulkCreate([
        { grup, nomenu: "M001", open: true, update: true, pemakai: req.url == '/register' ? username.toUpperCase() : req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
        { grup, nomenu: "M002", open: true, pemakai: req.url == '/register' ? username.toUpperCase() : req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
        { grup, nomenu: "M010", open: true, add: true, pemakai: req.url == '/register' ? username.toUpperCase() : req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
        { grup, nomenu: "M014", open: true, pemakai: req.url == '/register' ? username.toUpperCase() : req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
      ], { transaction });

      await oto_report.destroy({ where: { grup } }, { transaction });
      await oto_report.create({
        grup, report: "R002", aktif: true, periode: true, pdf: true, pemakai: req.url == '/register' ? username.toUpperCase() : req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss")
      }, { transaction });

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

      const res_user = await login.findOne({ where: { username: username.toUpperCase() }, transaction });
      if (!res_user.aktif && aktif) {
        await oto_menu.destroy({ where: { grup } }, { transaction });
        await oto_menu.bulkCreate([
          { grup, nomenu: "M001", open: true, update: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
          { grup, nomenu: "M002", open: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
          { grup, nomenu: "M010", open: true, add: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
          { grup, nomenu: "M014", open: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
        ], { transaction });

        await oto_report.destroy({ where: { grup } }, { transaction });
        await oto_report.create({
          grup, report: "R002", aktif: true, periode: true, pdf: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss")
        }, { transaction });
      }

      const enc_pass = encrypt(password);
      await login.update({ password: enc_pass, pemakai: req.user.myusername.toUpperCase(), grup, aktif }, { where: { username: username.toUpperCase() }, transaction });

      if (!aktif) {
        await oto_menu.destroy({ where: { grup } }, { transaction });
        await oto_report.destroy({ where: { grup } }, { transaction });
      }

      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil diubah" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  get_periode: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await konfigurasi.findOne({ attributes: ["tglawal", "tglakhir"],where: { kodetoko: req.user.mycabang } }, { transaction });
      await transaction.commit();
      return res.status(200).json({ data: data || {}, error: false, message: "Data berhasil diambil" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update_periode: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { tglawal, tglakhir } = req.body;
      await konfigurasi.update(
        { tglawal: moment(tglawal).format("YYYY-MM-DD"), tglakhir: moment(tglakhir).format("YYYY-MM-DD"), pemakai: req.user.myusername.toUpperCase(), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss") },
        { where: { kodetoko: req.user.mycabang }, transaction }
      );
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
