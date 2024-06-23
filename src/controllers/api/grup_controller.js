import grup from "../../models/api/grup_model";
import sq from "../../db";
import moment from "moment";
moment.locale("id");

const grup_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { kode } = req.query;
      const data = await grup.findOne({ attributes: ["nama", "kode", "aktif"],where: { kode }, transaction });
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
      const { nama, kode } = req.body;
      await grup.create({ nama: nama.toUpperCase(), kode: kode.toUpperCase(), aktif: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil disimpan" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { nama, kode, aktif } = req.body;
      await grup.update({ nama: nama.toUpperCase(), aktif }, { where: { kode }, transaction });
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil diubah" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
}

export default grup_cont;