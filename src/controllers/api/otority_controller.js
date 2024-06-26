import menu from "../../models/api/menu_model";
import moment from "moment";
import { Op } from "sequelize";
moment.locale("id");

const otority_cont = {
  all_menu: async (req, res) => {
    try {
      const data = await menu.findAll({
        where: { aktif: true },
        order: [
          ["nourut", "ASC"],
          ["urut_global", "ASC"],
        ],
      });
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
  likes_menu: async (req, res) => {
    try {
      const data = await menu.findAll({
        where: {
          aktif: true,
          namamenu: { [Op.iLike]: `%${req.query.q}%` },
          nomenu: {
            [Op.iLike]: `%${req.query.q}%`,
          },
        },
        order: [
          ["nourut", "ASC"],
          ["urut_global", "ASC"],
        ],
      });
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  },
};

export default otority_cont;
