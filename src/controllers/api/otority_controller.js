import menu from "../../models/api/menu_model";
import oto_menu from "../../models/api/oto_menu_model";
import moment from "moment";
import { Op } from "sequelize";
import sq from "../../db";
const Sequelize = require("sequelize");
moment.locale("id");

const otority_cont = {
  all_menu: async (req, res) => {
    try {
      const data = await menu.findAll({
        attributes:['grupmenu', 'nomenu', 'namamenu'],
        where: {
          aktif: true,
          nomenu: {
            [Op.ne]: "M008",
          },
        },
        order: [
          ["nourut", "ASC"],
          ["urut_global", "ASC"],
        ],
      });
      data.forEach((item) => {
        // set new attributes with default value false
        item.setDataValue("add", false);
        item.setDataValue("update", false);
        item.setDataValue("cancel", false);
      });
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
  menu_role: async (req, res) => {
    try {
      const data = await sq.query(`SELECT nomenu, namamenu, grupmenu, add, update, cancel from cari_oto_menu where grup = :grup`, {replacements: {grup: req.query.grup.toUpperCase()}, type: Sequelize.QueryTypes.SELECT});
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
  likes_menu: async (req, res) => {
    try {
      const data = await menu.findAll({
        attributes: ["grupmenu", "nomenu", "namamenu"],
        where: {
          aktif: true,
          [Op.or]: {
            namamenu: { [Op.iLike]: `%${req.query.q}%` },
            nomenu: {
              [Op.iLike]: `%${req.query.q}%`,
            },
          },
        },
        order: [
          ["nourut", "ASC"],
          ["urut_global", "ASC"],
        ],
      });
      data.forEach((item) => {
        // set new attributes with default value false
        item.setDataValue("add", false);
        item.setDataValue("update", false);
        item.setDataValue("cancel", false);
      });
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
  save: async (req, res) => {
    try {
      const { grup, nomenu, add, update, cancel } = req.body;
      const data = await oto_menu.findOne({ where: { grup, nomenu } });
      if (data) {
        await oto_menu.update({ add, update, cancel }, { where: { grup, nomenu } });
      } else {
        await oto_menu.create({ grup, nomenu, add, update, cancel });
      }
      return res.status(200).json({ error: false, message: "Data berhasil disimpan" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  }
};

export default otority_cont;
