import { body, check, validationResult } from "express-validator";
import login from "../models/api/login_model";
import grup from "../models/api/grup_model";
import { Op } from "sequelize";
import satuan from "../models/api/satuan_model";
import kategori from "../models/api/kategori_model";
import barang from "../models/api/barang_model";
import cari_stock_barang from "../models/api/cari_stock_barang";
import cari_stock_real_barang from "../models/api/cari_stock_real_barang";
import cari_pembelian from "../models/api/cari_order";
import cari_sales from "../models/api/cari_sales";
import month_diff from "./month_diff";
import moment from "moment";
import cari_barang_rusak from "../models/api/cari_barang_rusak";
import cari_repack_barang from "../models/api/cari_repack_barang";
import cari_rules_reports from "../models/api/cari_rules_reports";
import { decrypt } from "./encrypt";
import cari_barang_view from "../models/api/cari_barang_model";

export const check_login = [
  check("username", "Username harus diisi").notEmpty().isString(),
  check("password", "Password harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await login.findOne({ where: { username: username.toUpperCase(), aktif: true } });
      if (!user) throw new Error("Username tidak ditemukan");
      if (decrypt(user.password) !== password) throw new Error("Password salah");
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
      const user = await login.findOne({ where: { username: username.toUpperCase() } });
      if (!user) throw new Error("Username tidak ditemukan");
      if (decrypt(user.password) === password) throw new Error("Pasword sama dengan sebelumnya");
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
  check("nama", "Nama harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { nama } = req.body;
      const check = await grup.findOne({ where: { nama: nama.toUpperCase() } });
      if (check) throw new Error("Nama Grup sudah digunakan");
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
      const { kode, nama } = req.body;
      const check = await grup.findOne({ where: { kode: kode.toUpperCase() } });
      if (!check) throw new Error("Kode Grup tidak ditemukan");
      const check_name = await grup.findOne({
        where: {
          nama: nama.toUpperCase(),
          kode: {
            [Op.ne]: kode.toUpperCase(),
          },
        },
      })
      if (check_name) throw new Error("Nama Grup sudah digunakan");
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

export const check_update_periode = [
  check("tglawal", "Tanggal Awal harus diisi").notEmpty().isString(),
  check("tglakhir", "Tanggal Akhir harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
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
      if (check) throw new Error("Nama Satuan sudah digunakan");
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
        },
      });
      if (check) throw new Error("Nama Satuan sudah digunakan");
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
      if (check) throw new Error("Nama Kategori sudah digunakan");
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
        },
      });
      if (check) throw new Error("Nama Kategori sudah digunakan");
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_save_barang = [
  check("barcode", "Barcode Barang harus diisi").notEmpty().isString(),
  check("nama", "Nama Barang harus diisi").notEmpty().isString(),
  check("kode_satuan", "Nama Satuan harus diisi").notEmpty().isString(),
  check("kode_kategori", "Nama Kategori harus diisi").notEmpty().isString(),
  check("min_stock", "Min Stock harus diisi").notEmpty().isString(),
  check("disc", "Diskon harus diisi").notEmpty().isString(),
  check("harga_jual", "Harga Jual harus diisi").notEmpty().isString(),
  check("harga_modal", "Harga Modal harus diisi").notEmpty().isString(),
  check("repack", "Repack harus diisi").notEmpty().isBoolean(),
  async (req, res, next) => {
    try {
      const { barcode, repack, barang_induk, qty_repack, nama_satuan } = req.body;
      const check = await barang.findOne({ where: { barcode: barcode.toUpperCase() } });
      if (check) throw new Error("Barcode sudah digunakan");
      if (repack) {
        if (barang_induk == '') throw new Error("Barcode Induk harus diisi");
        const check_barang_induk = await cari_barang_view.findOne({ where: { barcode: barang_induk.toUpperCase() } });
        if (!check_barang_induk) throw new Error("Barcode Induk tidak ditemukan");
        if (!qty_repack) throw new Error("Qty Repack harus diisi");
        if (nama_satuan == check_barang_induk.nama_satuan) throw new Error("Satuan Repack tidak boleh sama dengan Satuan Induk");
      }
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
  check("barcode", "Barcode Barang harus diisi").notEmpty().isString(),
  check("nama", "Nama Barang harus diisi").notEmpty().isString(),
  check("kode_satuan", "Nama Satuan harus diisi").notEmpty().isString(),
  check("kode_kategori", "Nama Kategori harus diisi").notEmpty().isString(),
  check("min_stock", "Min Stock harus diisi").notEmpty().isString(),
  check("disc", "Diskon harus diisi").notEmpty().isString(),
  check("harga_jual", "Harga Jual harus diisi").notEmpty().isString(),
  check("harga_modal", "Harga Modal harus diisi").notEmpty().isString(),
  check("aktif", "Aktif harus diisi").notEmpty().isBoolean(),
  check("repack", "Repack harus diisi").notEmpty().isBoolean(),
  async (req, res, next) => {
    try {
      const { old_barcode, barcode, repack, barang_induk, qty_repack, nama_satuan } = req.body;
      const check = await barang.findOne({ where: { barcode: old_barcode.toUpperCase() } });
      if (!check) throw new Error("Barcode tidak ditemukan");
      const duplicate = await barang.findOne({
        where: {
          barcode: {
            [Op.ne]: old_barcode.toUpperCase(),
          },
          barcode: barcode.toUpperCase(),
        },
      });
      if (!duplicate) throw new Error("Barcode sudah digunakan");
      if (repack) {
        if (barang_induk == "") throw new Error("Barcode Induk harus diisi");
        const check_barang_induk = await cari_barang_view.findOne({ where: { barcode: barang_induk.toUpperCase() } });
        if (!check_barang_induk) throw new Error("Barcode Induk tidak ditemukan");
        if (!qty_repack) throw new Error("Qty Repack harus diisi");
        if (nama_satuan == check_barang_induk.nama_satuan) throw new Error("Satuan Repack tidak boleh sama dengan Satuan Induk");
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_save_otority = [
  check("kode_grup", "Mohon pilih nama grup terlebih dahulu !!!").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const menus = JSON.parse(req.body.menus);
      const reports = JSON.parse(req.body.reports);

      if (menus.length === 0) throw new Error("Harus pilih menu !!!");
      menus.forEach((item) => {
        if (!item.add && !item.update && !item.cancel) throw new Error("Harus pilih akses menu !!!");
      });

      if (reports.length === 0) throw new Error("Harus pilih report !!!");
      for (const item of reports) {
        const rule_report = await cari_rules_reports.findOne({ attributes: ["barang", "periode", "pdf", "excel"],where: { report: item.report } });
        if (!rule_report) throw new Error("Report tidak ditemukan !!!");
        if ((!item.barang && rule_report.barang) && (!item.periode && rule_report.periode) && (!item.pdf && rule_report.pdf)) throw new Error("Harus pilih akses report !!!");
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_save_order = [
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { tanggal } = req.body;
      const list_barang = JSON.parse(req.body.list_barang);
      if (list_barang.length === 0) throw new Error("Harus input barang !!!");
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      for (const barang of list_barang) {
        const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          }
        }
      }
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true, e });
    }
  },
];

export const check_update_order = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { tanggal, nomor } = req.body;
      const list_barang = JSON.parse(req.body.list_barang);
      if (list_barang.length === 0) throw new Error("Harus input barang !!!");
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      for (const barang of list_barang) {
        const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          }
        }
      }
      const detail = await cari_pembelian.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor } });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              const qty_list_barang = list_barang.some((item) => item.barcode === barang.barcode) ? list_barang.find((item) => item.barcode === barang.barcode).qty : 0;
              if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} sudah dipakai di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            const qty_list_barang = list_barang.some((item) => item.barcode === barang.barcode) ? list_barang.find((item) => item.barcode === barang.barcode).qty : 0;
            if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} sudah dipakai di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          }
        }
      }
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_cancel_order = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("alasan", "Alasan harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { nomor } = req.body;
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      const detail = await cari_pembelian.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor } });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now < Number(barang.qty)) throw new Error(`Stock ${barang.nama_barang} sudah dipakai di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else throw new Error(`Stock tidak ditemukan di periode ${periode_stock} !!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now < Number(barang.qty)) throw new Error(`Stock ${barang.nama_barang} sudah dipakai di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock tidak ditemukan di periode ${periode} !!!`);
        }
      }
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true, e });
    }
  },
];

export const check_save_sales = [
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { tanggal } = req.body;
      const list_barang = JSON.parse(req.body.list_barang);
      if (list_barang.length === 0) throw new Error("Harus input barang !!!");
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      for (const barang of list_barang) {
        const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (Number(barang.qty) > stock_real_now) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (Number(barang.qty) > stock_real_now) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
        }
      }

      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: e.message, error: true, e });
    }
  },
];

export const check_update_sales = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { tanggal, nomor } = req.body;
      const list_barang = JSON.parse(req.body.list_barang);
      if (list_barang.length === 0) throw new Error("Harus input barang !!!");
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      for (const barang of list_barang) {
        const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else {
              throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else {
            throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
          }
        }
      }
      const detail = await cari_sales.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor } });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              const qty_list_barang = list_barang.some((item) => item.barcode === barang.barcode) ? list_barang.find((item) => item.barcode === barang.barcode).qty : 0;
              if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else {
              throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            const qty_list_barang = list_barang.some((item) => item.barcode === barang.barcode) ? list_barang.find((item) => item.barcode === barang.barcode).qty : 0;
            if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else {
            throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
          }
        }
      }
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_cancel_sales = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("alasan", "Alasan harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { nomor } = req.body;
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      const detail = await cari_sales.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor } });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else {
              throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else {
            throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
          }
        }
      }
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true, e });
    }
  },
];

export const check_save_barang_rusak = [
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { tanggal } = req.body;
      const list_barang = JSON.parse(req.body.list_barang);
      if (list_barang.length === 0) throw new Error("Harus input barang !!!");
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      for (const barang of list_barang) {
        const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (Number(barang.qty) > stock_real_now) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (Number(barang.qty) > stock_real_now) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
        }
      }

      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true, e });
    }
  },
];

export const check_update_barang_rusak = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { tanggal, nomor } = req.body;
      const list_barang = JSON.parse(req.body.list_barang);
      if (list_barang.length === 0) throw new Error("Harus input barang !!!");
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");

      const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of list_barang) {
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else {
              throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else {
            throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
          }
        }
      }

      const detail = await cari_barang_rusak.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor } });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              const qty_list_barang = list_barang.some((item) => item.barcode === barang.barcode) ? list_barang.find((item) => item.barcode === barang.barcode).qty : 0;
              if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else {
              throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            const qty_list_barang = list_barang.some((item) => item.barcode === barang.barcode) ? list_barang.find((item) => item.barcode === barang.barcode).qty : 0;
            if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else {
            throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
          }
        }
      }

      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_cancel_barang_rusak = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("alasan", "Alasan harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { nomor } = req.body;
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      const detail = await cari_barang_rusak.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor } });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else {
              throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else {
            throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
          }
        }
      }
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_save_repack_barang = [
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { tanggal } = req.body;
      const list_barang_proses = JSON.parse(req.body.list_barang_proses);
      const list_barang_hasil = JSON.parse(req.body.list_barang_hasil);
      if (list_barang_proses.length === 0) throw new Error("Harus input barang proses !!!");
      if (list_barang_hasil.length === 0) throw new Error("Harus input barang hasil !!!");
      if (list_barang_proses.some(item=>item.barcode == list_barang_hasil.find(item=>item.barcode).barcode || '')) throw new Error("Barang proses dan hasil tidak boleh sama !!!");
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);

      for (const barang of list_barang_proses) {
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (Number(barang.qty) > stock_real_now) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (Number(barang.qty) > stock_real_now) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
        }
      }

      for (const barang of list_barang_hasil) {
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
        }
      }

      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
];

export const check_update_repack_barang = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const { tanggal, nomor } = req.body;
      const list_barang_proses = JSON.parse(req.body.list_barang_proses);
      const list_barang_hasil = JSON.parse(req.body.list_barang_hasil);
      if (list_barang_proses.length === 0) throw new Error("Harus input barang proses !!!");
      if (list_barang_hasil.length === 0) throw new Error("Harus input barang hasil !!!");
      if (list_barang_proses.some(item => item.barcode == list_barang_hasil.find(item => item.barcode).barcode || '')) throw new Error("Barang proses dan hasil tidak boleh sama !!!");
      const periode = moment().format("YYYYMM");

      const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of list_barang_proses) {
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!!`);
        }
      }

      for (const barang of list_barang_hasil) {
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!!`);
        }
      }

      const detail_proses = await cari_repack_barang.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor, jenis: "proses" } });
      for (const barang of detail_proses) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              const qty_list_barang = list_barang_proses.some((item) => item.barcode === barang.barcode) ? list_barang_proses.find((item) => item.barcode === barang.barcode).qty : 0;
              console.log({ stock_real_now, qty_list_barang, qty: stock_real_now + Number(qty_list_barang) });
              if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode_stock} !!!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            const qty_list_barang = list_barang_proses.some((item) => item.barcode === barang.barcode) ? list_barang_proses.find((item) => item.barcode === barang.barcode).qty : 0;
            if (stock_real_now + Number(barang.qty) < Number(qty_list_barang)) throw new Error(`Stock ${barang.nama_barang} tidak cukup di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
        }
      }

      const detail_hasil = await cari_repack_barang.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock"], where: { nomor, jenis: "hasil" } });
      for (const barang of detail_hasil) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              const qty_list_barang = list_barang_hasil.some((item) => item.barcode === barang.barcode) ? list_barang_hasil.find((item) => item.barcode === barang.barcode).qty : 0;
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            const qty_list_barang = list_barang_hasil.some((item) => item.barcode === barang.barcode) ? list_barang_hasil.find((item) => item.barcode === barang.barcode).qty : 0;
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
        }
      }

      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  }
]

export const check_cancel_repack_barang = [
  check("nomor", "Nomor harus diisi").notEmpty().isString(),
  check("alasan", "Alasan harus diisi").notEmpty().isString(),
  check("tanggal", "Tanggal harus diisi").notEmpty().isString(),
  async (req, res, next) => {
    try {
      const { nomor } = req.body;
      const errors = validationResult(req);
      const periode = moment().format("YYYYMM");
      const detail = await cari_repack_barang.findAll({ attributes: ["barcode", "nama_barang", "tanggal", "qty", "stock", "jenis"], where: { nomor } });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode: periode_stock } });
            const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode: periode_stock } });
            if (stock && stock_real) {
              const stock_now = Number(stock.stock);
              const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
              if (barang.jenis == "hasil" && stock_real_now < Number(barang.qty)) throw new Error(`Stock ${barang.nama_barang} sudah dipakai di periode ${periode_stock} !!!`);
              if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode_stock} !!!`);
            } else {
              throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode_stock} !!!`);
            }
          }
        } else {
          const stock = await cari_stock_barang.findOne({ attributes: ["periode", "barcode", "stock"], where: { barcode: barang.barcode, periode } });
          const stock_real = await cari_stock_real_barang.findOne({ attributes: ["periode", "barcode", "awal", "masuk", "keluar"], where: { barcode: barang.barcode, periode } });
          if (stock && stock_real) {
            const stock_now = Number(stock.stock);
            const stock_real_now = Number(Number(stock_real.awal) + Number(stock_real.masuk) - Number(stock_real.keluar));
            if (barang.jenis == "hasil" && stock_real_now < Number(barang.qty)) throw new Error(`Stock ${barang.nama_barang} sudah dipakai di periode ${periode} !!!`);
            if (stock_real_now != stock_now) throw new Error(`Stock ${barang.nama_barang} tidak sama di periode ${periode} !!!`);
          } else {
            throw new Error(`Stock ${barang.nama_barang} tidak ditemukan di periode ${periode} !!!`);
          }
        }
      }
      if (!errors.isEmpty()) throw new Error(errors.array()[0].msg);
      next();
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  }
]