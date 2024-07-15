import cari_oto_report from "../../models/api/cari_oto_report";
import { options_report } from "../../utils/options";
import pdf from "pdf-creator-node";
import compile_hbs from "../../utils/compile_hbs";
import moment from "moment";
import sq from "../../db";
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
    try {
      await transaction.commit();
      return res.status(200).json({ url: "", message: "Laporan berhasil diprint", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default report_cont;
