import { body, check, validationResult } from "express-validator";
import login_model from "../models/api/login";

export const login = [
  check("username", "Username harus diisi").notEmpty().isString(),
  check("password", "Password harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      // encode password base64
      const enc_pass = encodeURIComponent(btoa(password));
      const user = await login_model.findOne({ where: { username: username.toUpperCase() } });
      if (!user) throw new Error("Username tidak ditemukan");
      if (user.password !== enc_pass) throw new Error("Password salah");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true,e });
    }
  },
];

export const check_password = [
  check("username", "Username harus diisi").notEmpty().isString(),
  check("password", "Password harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      // encode password base64
      const enc_pass = encodeURIComponent(btoa(password));
      const user = await login_model.findOne({ where: { username: username.toUpperCase(), password: enc_pass } });
      if (user) throw new Error("Pasword sama dengan sebelumnya");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
]

export const check_info = [
  check("info", "Info harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(500).json({ message: errors.array()[0].msg, error: true });
    next();
  },
];