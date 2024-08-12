import oto_menu from "../../models/api/oto_menu_model";
import oto_report from "../../models/api/oto_report_model";
import cari_rules_reports from "../../models/api/cari_rules_reports";
import cari_rules_menus from "../../models/api/cari_rules_menus";
import moment from "moment";
import { Op } from "sequelize";
import sq from "../../db";
const Sequelize = require("sequelize");
moment.locale("id");

const otority_cont = {
  reports: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await cari_rules_reports.findAll({
        attributes: ["report", "nama", ["periode", "rule_periode"], ["barang", "rule_barang"], ["pdf", "rule_pdf"], ["excel", "rule_excel"]],
        order: [["pos", "ASC"]],
      });
      data.forEach(item => {
        item.setDataValue("periode", false);
        item.setDataValue("barang", false);
        item.setDataValue("pdf", false);
      })
      await transaction.commit();
      return res.status(200).json({ data, error: false, message: "Data Reports berhasil diambil" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: error.message, error: true });
    }
  },
  reports_role: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await sq.query(`SELECT grup, report, nama, pos, barang, periode, pdf, rule_periode, rule_barang, rule_pdf, rule_excel from cari_oto_rules_reports where grup = :grup`, {replacements: {grup: req.query.grup.toUpperCase()}, type: Sequelize.QueryTypes.SELECT});
      await transaction.commit();
      return res.status(200).json({ data, error: false, message: "Data Reports berhasil diambil" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: error.message, error: true });
    }
  },
  reports_likes: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await cari_rules_reports.findAll({
        attributes: ["report", "nama", ["periode", "rule_periode"], ["barang", "rule_barang"], ["pdf", "rule_pdf"], ["excel", "rule_excel"]],
        where: {
          [Op.or]: {
            nama: { [Op.iLike]: `%${req.query.q}%` },
            report: {
              [Op.iLike]: `%${req.query.q}%`,
            },
          },
        },
        order: [["pos", "ASC"]],
      });
      data.forEach(item => {
        item.setDataValue("periode", false);
        item.setDataValue("barang", false);
        item.setDataValue("pdf", false);
      })
      await transaction.commit();
      return res.status(200).json({ data, error: false, message: "Data Reports berhasil diambil" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: error.message, error: true });
    }
  },
  all_menu: async (req, res) => {
    try {
      const data = await cari_rules_menus.findAll({
        attributes: ["grupmenu", "nomenu", "namamenu", ["add", "rule_add"], ["update", "rule_update"], ["cancel", "rule_cancel"], ["backdate", "rule_backdate"]],
        where: {
          aktif: true,
          nomenu: {
            [Op.ne]: req.user.mygrup == "ITS" ? "" : "M008",
          },
        },
        order: [
          ["urut_global", "ASC"],
          ["nourut", "ASC"],
        ],
      });
      data.forEach((item) => {
        item.setDataValue("add", false);
        item.setDataValue("update", false);
        item.setDataValue("cancel", false);
        item.setDataValue("backdate", false);
      });
      return res.status(200).json({ data, error: false, message: "Data Menu berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
  menu_role: async (req, res) => {
    try {
      const data = await sq.query(`SELECT nomenu, namamenu, grupmenu, add, update, cancel, backdate, rule_add, rule_update, rule_cancel, rule_backdate from cari_oto_rules_menus where grup = :grup`, {replacements: {grup: req.query.grup.toUpperCase()}, type: Sequelize.QueryTypes.SELECT});
      return res.status(200).json({ data, error: false, message: "Data Menu berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
  likes_menu: async (req, res) => {
    try {
      const data = await cari_rules_menus.findAll({
        attributes: ["grupmenu", "nomenu", "namamenu", ["add", "rule_add"], ["update", "rule_update"], ["cancel", "rule_cancel"], ["backdate", "rule_backdate"]],
        where: {
          aktif: true,
          nomenu: {
            [Op.ne]: req.user.mygrup == "ITS" ? "" : "M008",
          },
          [Op.or]: {
            namamenu: { [Op.iLike]: `%${req.query.q}%` },
            nomenu: {
              [Op.iLike]: `%${req.query.q}%`,
            },
          },
        },
        order: [
          ["urut_global", "ASC"],
          ["nourut", "ASC"],
        ],
      });
      data.forEach((item) => {
        item.setDataValue("add", false);
        item.setDataValue("update", false);
        item.setDataValue("cancel", false);
        item.setDataValue("backdate", false);
      });
      return res.status(200).json({ data, error: false, message: "Data Menu berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
  save: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { kode_grup } = req.body;
      const menus = JSON.parse(req.body.menus);
      await oto_menu.destroy({ where: { grup: kode_grup } }, {transaction});

      const reports = JSON.parse(req.body.reports);
      await oto_report.destroy({ where: { grup: kode_grup } }, {transaction});

      menus.forEach(async (item) => {
        const { nomenu, add, update, cancel, backdate } = item;
        await oto_menu.create({ grup:kode_grup, nomenu, add, update, cancel, backdate, open: true });
      });

      reports.forEach(async (item) => {
        const { report, periode, barang, pdf } = item;
        await oto_report.create({ grup: kode_grup, report, aktif: true, periode, barang, pdf });
      });

      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data otoritas berhasil disimpan" });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: error.message, error: true });
    }
  }
};

export default otority_cont;
