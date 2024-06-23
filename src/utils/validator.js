import { body, check, validationResult } from "express-validator";
import login from "../models/api/login_model";
import grup from "../models/api/grup_model";
import { Op } from "sequelize";

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
