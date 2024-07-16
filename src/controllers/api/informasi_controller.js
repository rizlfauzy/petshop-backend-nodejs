import informasi from "../../models/api/informasi_model";
import sq from "../../db";
import moment from "moment";
moment.locale("id");

const info_cont = {
  index: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await informasi.findOne({ attributes: ["info"], order: [["id", "DESC"]] }, { transaction });
      await transaction.commit();
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  save: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await informasi.create({ info: req.body.info, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });
      await transaction.commit();
      return res.status(200).json({ data, error: false, message: "Data berhasil disimpan" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default info_cont;
