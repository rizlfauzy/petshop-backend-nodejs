import cari_oto_report from "../../models/api/cari_oto_report";
import cari_pembelian from "../../models/api/cari_order";
import cari_sales from "../../models/api/cari_sales";
import cari_stock_all_transaksi from "../../models/api/cari_stock_all_transaksi";
import barang_model from "../../models/api/barang_model";

import { options_report } from "../../utils/options";
import pdf from "pdf-creator-node";
import compile_hbs from "../../utils/compile_hbs";
import { format_rupiah, deformat_rupiah } from "../../utils/format";
import moment from "moment";
import sq from "../../db";
import { literal } from "sequelize";
import fs from "fs";
const Sequelize = require("sequelize");
require("dotenv").config();
const { APP_URL } = process.env;

const report_cont = {
  reports: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const reports = await cari_oto_report.findAll(
        {
          where: { aktif: true, grup: req.user.mygrup },
          attributes: ["report", "nama", "report_url"],
          order: [["pos", "ASC"]],
        },
        { transaction }
      );
      await transaction.commit();
      return res.status(200).json({ data: reports, message: "Data berhasil ditemukan", error: false });
    } catch (e) {
      await transaction.rollback();
      res.status(500).json({ message: e.message, error: true });
    }
  },
  report: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const report = await cari_oto_report.findOne(
        {
          where: { report: req.query.report, aktif: true, grup: req.user.mygrup },
          attributes: ["report", "nama", "report_url", "barang", "periode", "pdf"],
        },
        { transaction }
      );
      await transaction.commit();
      return res.status(200).json({ data: report, message: "Data berhasil ditemukan", error: false });
    } catch (e) {
      await transaction.rollback();
      res.status(500).json({ message: e.message, error: true });
    }
  },
  orders: async (req, res) => {
    const transaction = await sq.transaction();
    const path_file = "./public/pdf/";
    try {
      const { tgl_awal, tgl_akhir } = req.query;
      const nama_file = `Laporan_Pembelian_${moment().format("YYYYMMDDHHmmss")}.pdf`;
      const headers = await cari_pembelian.findAll(
        {
          where: literal(`to_char(tanggal, 'YYYYMMDD') BETWEEN '${tgl_awal}' AND '${tgl_akhir}'`),
          attributes: ["nomor", "tanggal"],
          group: ["nomor", "tanggal"],
        },
        { transaction }
      );
      const details = await cari_pembelian.findAll(
        {
          where: literal(`to_char(tanggal, 'YYYYMMDD') BETWEEN '${tgl_awal}' AND '${tgl_akhir}'`),
          attributes: ["nomor", "barcode", "nama_barang", "qty", "harga", "total"],
        },
        { transaction }
      );
      const data_details = JSON.parse(JSON.stringify(details)).map((item) => ({ ...item, qty: format_rupiah(item.qty, {}), harga: format_rupiah(item.harga), total: format_rupiah(item.total) }));

      const grand_total = format_rupiah(details.reduce((acc, curr) => acc + Number(curr.total), 0));
      const tglawal = moment(tgl_awal).format("DD MMMM YYYY");
      const tglakhir = moment(tgl_akhir).format("DD MMMM YYYY");
      const waktu_cetak = moment().format("HH:mm:ss");
      const data = {
        headers: JSON.parse(JSON.stringify(headers)).map((item) => ({ ...item, tanggal: moment(item.tanggal).format("DD-MM-YYYY"), list_details: data_details.filter((x) => x.nomor === item.nomor) })),
        grand_total,
        tglawal,
        tglakhir,
        waktu_cetak,
        title: "Laporan Pembelian",
      };

      if (!fs.existsSync("./public/")) fs.mkdirSync("./public/");
      if (!fs.existsSync(path_file)) fs.mkdirSync(path_file);

      const html = compile_hbs("report_orders", data);
      const document = { html, data, path: path_file + nama_file };

      await pdf.create(document, options_report);

      setTimeout(() => {
        fs.unlinkSync(path_file + nama_file);
      }, 1500);

      await transaction.commit();
      return res.status(200).json({ url: `${APP_URL}/pdf/${nama_file}`, message: "Laporan berhasil diprint", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  sales: async (req, res) => {
    const transaction = await sq.transaction();
    const path_file = "./public/pdf/";
    try {
      const { tgl_awal, tgl_akhir } = req.query;
      const nama_file = `Laporan_Penjualan_${moment().format("YYYYMMDDHHmmss")}.pdf`;
      const headers = await cari_sales.findAll(
        {
          where: literal(`to_char(tanggal, 'YYYYMMDD') BETWEEN '${tgl_awal}' AND '${tgl_akhir}'`),
          attributes: ["nomor", "tanggal"],
          group: ["nomor", "tanggal"],
        },
        { transaction }
      );
      const details = await cari_sales.findAll(
        {
          where: literal(`to_char(tanggal, 'YYYYMMDD') BETWEEN '${tgl_awal}' AND '${tgl_akhir}'`),
          attributes: ["nomor", "barcode", "nama_barang", "qty", "harga", "disc", "nilai_disc", "total"],
        },
        { transaction }
      );
      const data_details = JSON.parse(JSON.stringify(details)).map((item) => ({
        ...item,
        qty: format_rupiah(item.qty, {}),
        harga: format_rupiah(item.harga),
        disc: format_rupiah(item.disc, {}),
        nilai_disc: format_rupiah(item.nilai_disc),
        total: format_rupiah(item.total),
      }));

      const grand_total = format_rupiah(details.reduce((acc, curr) => acc + Number(curr.total), 0));
      const tglawal = moment(tgl_awal).format("DD MMMM YYYY");
      const tglakhir = moment(tgl_akhir).format("DD MMMM YYYY");
      const waktu_cetak = moment().format("HH:mm:ss");
      const data = {
        headers: JSON.parse(JSON.stringify(headers)).map((item) => ({ ...item, tanggal: moment(item.tanggal).format("DD-MM-YYYY"), list_details: data_details.filter((x) => x.nomor === item.nomor) })),
        grand_total,
        tglawal,
        tglakhir,
        waktu_cetak,
        title: "Laporan Penjualan",
      };

      if (!fs.existsSync("./public/")) fs.mkdirSync("./public/");
      if (!fs.existsSync(path_file)) fs.mkdirSync(path_file);

      const html = compile_hbs("report_sales", data);
      const document = { html, data, path: path_file + nama_file };

      await pdf.create(document, options_report);

      setTimeout(() => {
        fs.unlinkSync(path_file + nama_file);
      }, 1500);

      await transaction.commit();
      return res.status(200).json({ url: `${APP_URL}/pdf/${nama_file}`, message: "Laporan berhasil diprint", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  stocks: async (req, res) => {
    const transaction = await sq.transaction();
    const path_file = "./public/pdf/";
    try {
      const { tgl_awal, tgl_akhir } = req.query;
      const nama_file = `Kartu_Stocks_${moment().format("YYYYMMDDHHmmss")}.pdf`;
      const details = await sq.query(`SELECT * FROM get_stocks_by_date(:tgl_awal, :tgl_akhir)`, { replacements: { tgl_awal, tgl_akhir }, type: Sequelize.QueryTypes.SELECT, transaction });
      const data_details = JSON.parse(JSON.stringify(details)).map((item, i) => ({
        ...item,
        qty_awal: format_rupiah(item.qty_awal, {}),
        qty_masuk: format_rupiah(item.qty_masuk, {}),
        qty_keluar: format_rupiah(item.qty_keluar, {}),
        stock: format_rupiah(item.stock, {}),
        no: i + 1,
      }));

      const tglawal = moment(tgl_awal).format("DD MMMM YYYY");
      const tglakhir = moment(tgl_akhir).format("DD MMMM YYYY");
      const waktu_cetak = moment().format("HH:mm:ss");
      const data = {
        details: data_details,
        tglawal,
        tglakhir,
        waktu_cetak,
        title: "Kartu Stocks",
      };

      if (!fs.existsSync("./public/")) fs.mkdirSync("./public/");
      if (!fs.existsSync(path_file)) fs.mkdirSync(path_file);

      const html = compile_hbs("kartu_stocks", data);
      const document = { html, data, path: path_file + nama_file };

      await pdf.create(document, options_report);

      setTimeout(() => {
        fs.unlinkSync(path_file + nama_file);
      }, 1500);

      await transaction.commit();
      return res.status(200).json({ message: "Data berhasil ditemukan", error: false, url: `${APP_URL}/pdf/${nama_file}` });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  stock: async (req, res) => {
    const transaction = await sq.transaction();
    const path_file = "./public/pdf/";
    try {
      const { tgl_awal, tgl_akhir, barcode } = req.query;
      const nama_file = `Kartu_Stock_Per_Barang_${moment().format("YYYYMMDDHHmmss")}.pdf`;

      const barang = await barang_model.findOne({
        where: {
          barcode
        },
        attributes: ["barcode", "nama"]
      })

      const stock_awal = (await sq.query(`SELECT * FROM get_stocks_by_date(:tgl_awal, :tgl_akhir) where barcode = :barcode`, { replacements: { tgl_awal, tgl_akhir, barcode }, type: Sequelize.QueryTypes.SELECT, transaction })) || null;
      const details_masuk = await cari_stock_all_transaksi.findAll(
        {
          attributes: ["nomor", "tanggal", "barcode", "nama_barang", "nama_satuan", "keterangan", "sub_keterangan", "qty_masuk", "qty_keluar"],
          where: literal(`to_char(tanggal, 'YYYYMMDD') BETWEEN '${tgl_awal}' AND '${tgl_akhir}' and barcode = '${barcode}' and qty_masuk > 0`),
        },
        { transaction }
      );
      const total_qty_masuk = format_rupiah(details_masuk.reduce((acc, curr) => acc + Number(curr.qty_masuk), 0), {});
      const data_details_masuk = JSON.parse(JSON.stringify(details_masuk)).map((item, i) => ({ ...item, qty_masuk: format_rupiah(item.qty_masuk, {}), qty_keluar: format_rupiah(item.qty_keluar, {}), no: i + 1 }));

      const details_keluar = await cari_stock_all_transaksi.findAll(
        {
          attributes: ["nomor", "tanggal", "barcode", "nama_barang", "nama_satuan", "keterangan", "sub_keterangan", "qty_masuk", "qty_keluar"],
          where: literal(`to_char(tanggal, 'YYYYMMDD') BETWEEN '${tgl_awal}' AND '${tgl_akhir}' and barcode = '${barcode}' and qty_keluar > 0`),
        },
        { transaction }
      );
      const total_qty_keluar = format_rupiah(
        details_keluar.reduce((acc, curr) => acc + Number(curr.qty_keluar), 0),
        {}
      );
      const data_details_keluar = JSON.parse(JSON.stringify(details_keluar)).map((item, i) => ({ ...item, qty_masuk: format_rupiah(item.qty_masuk, {}), qty_keluar: format_rupiah(item.qty_keluar, {}), no: i + 1 }));

      const tglawal = moment(tgl_awal).format("DD MMMM YYYY");
      const tglakhir = moment(tgl_akhir).format("DD MMMM YYYY");
      const waktu_cetak = moment().format("HH:mm:ss");
      const data = {
        stock_awal: JSON.parse(JSON.stringify(stock_awal))[0] || { qty_awal: 0, nama_satuan: "PC" },
        data_details_masuk,
        data_details_keluar,
        barang: JSON.parse(JSON.stringify(barang)),
        total_qty_masuk,
        total_qty_keluar,
        total_stock_akhir: format_rupiah(Number(stock_awal[0] ? stock_awal[0].qty_awal : 0) + Number(deformat_rupiah(total_qty_masuk)) - Number(deformat_rupiah(total_qty_keluar)), {}),
        tglawal,
        tglakhir,
        waktu_cetak,
        title: "Kartu Stock Per Barang",
      };

      const html = compile_hbs("kartu_stock_per_barang", data);
      const document = { html, data, path: path_file + nama_file };

      await pdf.create(document, options_report);

      setTimeout(() => {
        fs.unlinkSync(path_file + nama_file);
      }, 1500);

      await transaction.commit();
      return res.status(200).json({ url: `${APP_URL}/pdf/${nama_file}`, message: "Laporan berhasil diprint", error: false, data });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default report_cont;
