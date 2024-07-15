import cari_oto_report from "../../models/api/cari_oto_report";
import cari_pembelian from "../../models/api/cari_order";
import cari_sales from "../../models/api/cari_sales";

import { options_report } from "../../utils/options";
import pdf from "pdf-creator-node";
import compile_hbs from "../../utils/compile_hbs";
import { format_rupiah } from "../../utils/format";
import moment from "moment";
import sq from "../../db";
import { literal } from "sequelize";
import fs from "fs";
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
      const data_details = JSON.parse(JSON.stringify(details)).map((item) => ({ ...item, qty: format_rupiah(item.qty, {}), harga: format_rupiah(item.harga), disc: format_rupiah(item.disc, {}), nilai_disc: format_rupiah(item.nilai_disc), total: format_rupiah(item.total) }));

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
  }
};

export default report_cont;
