import { body, check, validationResult } from "express-validator";
import login from "../models/api/login_model";
import grup from "../models/api/grup_model";
import { Op } from "sequelize";
import satuan from "../models/api/satuan_model";
import kategori from "../models/api/kategori_model";
import barang from "../models/api/barang_model";

export const check_login = [
  check("username", "Username harus diisi").notEmpty().isString(),
  check("password", "Password harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const enc_pass = encodeURIComponent(btoa(password));
      const user = await login.findOne({ where: { username: username.toUpperCase(), aktif: true } });
      if (!user) throw new Error("Username tidak ditemukan");
      if (user.password !== enc_pass) throw new Error("Password salah");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true, e });
    }
  },
];

export const check_page = [
  check("page", "Page harus diisi").notEmpty().isInt(),
  check("limit", "Limit harus diisi").notEmpty().isInt(),
  check("name", "Nama harus diisi").notEmpty().isString(),
  check("select", "Select harus diisi").notEmpty().isString(),
  check("order", "Order harus diisi").notEmpty().isString(),
  check("where", "Where harus diisi").notEmpty().isString(),
  check("likes", "Likes harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(500).json({ message: errors.array()[0].msg, error: true });
    next();
  },
];

export const check_password = [
  check("username", "Username harus diisi").notEmpty().isString(),
  check("password", "Password harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const enc_pass = encodeURIComponent(btoa(password));
      const user = await login.findOne({ where: { username: username.toUpperCase(), password: enc_pass } });
      if (user) throw new Error("Pasword sama dengan sebelumnya");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_info = [
  check("info", "Info harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(500).json({ message: errors.array()[0].msg, error: true });
    next();
  },
];

export const check_save_grup = [
  check("kode", "Kode harus diisi").notEmpty().isString(),
  check("nama", "Nama harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { kode } = req.body;
      const check = await grup.findOne({ where: { kode: kode.toUpperCase() } });
      if (check) throw new Error("Kode sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_update_grup = [
  check("kode", "Kode harus diisi").notEmpty().isString(),
  check("nama", "Nama harus diisi").notEmpty().isString(),
  check("aktif", "Aktif harus diisi").notEmpty().isBoolean(),
  async (req, res, next) => {
    try {
      const { kode } = req.body;
      const check = await grup.findOne({ where: { kode: kode.toUpperCase() } });
      if (!check) throw new Error("Kode tidak ditemukan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_register_user = [
  check("username", "Username harus diisi").notEmpty().isString(),
  check("password", "Password harus diisi").notEmpty().isString(),
  check("kode_grup", "Grup harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { username } = req.body;
      const check = await login.findOne({ where: { username: username.toUpperCase() } });
      if (check) throw new Error("Username sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_update_user = [
  check("old_username", "Old Username harus diisi").notEmpty().isString(),
  check("username", "Username harus diisi").notEmpty().isString(),
  check("password", "Password harus diisi").notEmpty().isString(),
  check("kode_grup", "Grup harus diisi").notEmpty().isString(),
  check("aktif", "Aktif harus diisi").notEmpty().isBoolean(),
  async (req, res, next) => {
    try {
      const { username, old_username } = req.body;
      const check = await login.findOne({
        where: {
          username: {
            [Op.ne]: old_username.toUpperCase(),
          },
          username: username.toUpperCase(),
        },
      });
      if (!check) throw new Error("Username sudah digunakan !!!");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_save_satuan = [
  check("nama", "Nama harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { nama } = req.body;
      const check = await satuan.findOne({ where: { nama: nama.toUpperCase() } });
      if (check) throw new Error("Nama sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_update_satuan = [
  check("kode", "Kode harus diisi").notEmpty().isString(),
  check("nama", "Nama harus diisi").notEmpty().isString(),
  check("aktif", "Aktif harus diisi").notEmpty().isBoolean(),
  async (req, res, next) => {
    try {
      const { kode, nama } = req.body;
      const check = await satuan.findOne({
        where: {
          nama: nama.toUpperCase(),
          kode: {
            [Op.ne]: kode.toUpperCase(),
          },
        }
      })
      if (check) throw new Error("Nama sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_save_kategori = [
  check("nama", "Nama harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { nama } = req.body;
      const check = await kategori.findOne({ where: { nama: nama.toUpperCase() } });
      if (check) throw new Error("Nama sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_update_kategori = [
  check("kode", "Kode harus diisi").notEmpty().isString(),
  check("nama", "Nama harus diisi").notEmpty().isString(),
  check("aktif", "Aktif harus diisi").notEmpty().isBoolean(),
  async (req, res, next) => {
    try {
      const { kode, nama } = req.body;
      const check = await kategori.findOne({
        where: {
          nama: nama.toUpperCase(),
          kode: {
            [Op.ne]: kode.toUpperCase(),
          },
        }
      })
      if (check) throw new Error("Nama sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_save_barang = [
  check("barcode", "Barcode harus diisi").notEmpty().isString(),
  check("nama", "Nama harus diisi").notEmpty().isString(),
  check("kode_satuan", "Satuan harus diisi").notEmpty().isString(),
  check("kode_kategori", "Kategori harus diisi").notEmpty().isString(),
  check("min_stock", "Min Stock harus diisi").notEmpty().isString(),
  check("disc", "Disc harus diisi").notEmpty().isString(),
  check("harga_jual", "Harga Jual harus diisi").notEmpty().isString(),
  check("harga_modal", "Harga Modal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { barcode } = req.body;
      const check = await barang.findOne({ where: { barcode: barcode.toUpperCase() } });
      if (check) throw new Error("Barcode sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_update_barang = [
  check("old_barcode", "Old Barcode harus diisi").notEmpty().isString(),
  check("barcode", "Barcode harus diisi").notEmpty().isString(),
  check("nama", "Nama harus diisi").notEmpty().isString(),
  check("kode_satuan", "Satuan harus diisi").notEmpty().isString(),
  check("kode_kategori", "Kategori harus diisi").notEmpty().isString(),
  check("min_stock", "Min Stock harus diisi").notEmpty().isString(),
  check("disc", "Disc harus diisi").notEmpty().isString(),
  check("harga_jual", "Harga Jual harus diisi").notEmpty().isString(),
  check("harga_modal", "Harga Modal harus diisi").notEmpty().isString(),
  check("aktif", "Aktif harus diisi").notEmpty().isBoolean(),
  async (req, res, next) => {
    try {
      const { old_barcode, barcode } = req.body;
      const check = await barang.findOne({ where: { barcode: old_barcode.toUpperCase() } });
      if (!check) throw new Error("Barcode tidak ditemukan");
      const duplicate = await barang.findOne({
        where: {
          barcode: {
            [Op.ne]: old_barcode.toUpperCase(),
          },
          barcode: barcode.toUpperCase(),
        }
      })
      if (!duplicate) throw new Error("Barcode sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];