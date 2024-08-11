import grup from "../../models/api/grup_model";
import sq from "../../db";
import moment from "moment";
import oto_menu from "../../models/api/oto_menu_model";
import oto_report from "../../models/api/oto_report_model";
import generate_kode from "../../utils/generate_kode";
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
      const { nama } = req.body;
      const kode = await generate_kode("grup", "GR-", "kode", 3, "00001", 5);

      await grup.create({ nama: nama.toUpperCase(), kode: kode.toUpperCase(), aktif: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });

      await oto_menu.destroy({ where: { grup: kode } }, { transaction });
      await oto_menu.bulkCreate([
        { grup: kode, nomenu: "M001", open: true, update: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
        { grup: kode, nomenu: "M002", open: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
        { grup: kode, nomenu: "M010", open: true, add: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
        { grup: kode, nomenu: "M014", open: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
      ], { transaction });

      await oto_report.destroy({ where: { grup: kode } }, { transaction });
      await oto_report.create({
        grup: kode, report: 'R002', aktif: true, periode: true, pdf: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss")
      }, {transaction});

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

      const res_grup = await grup.findOne({ where: { kode }, transaction });

      if (!res_grup.aktif && aktif) {
        await oto_menu.destroy({ where: { grup: kode } }, { transaction });
        await oto_menu.bulkCreate(
          [
            { grup: kode, nomenu: "M001", open: true, update: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
            { grup: kode, nomenu: "M002", open: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
            { grup: kode, nomenu: "M010", open: true, add: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
            { grup: kode, nomenu: "M014", open: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") },
          ],
          { transaction }
        );

        await oto_report.destroy({ where: { grup: kode } }, { transaction });
        await oto_report.create({
          grup:kode, report: 'R002', aktif: true, periode: true, pdf: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss")
        }, { transaction });
      }

      await grup.update({ nama: nama.toUpperCase(), pemakai: req.user.myusername.toUpperCase(), aktif }, { where: { kode }, transaction });

      if (!aktif) {
        await oto_menu.destroy({ where: { grup: kode } }, { transaction });
        await oto_report.destroy({ where: { grup: kode } }, { transaction });
      }

      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil diubah" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
}

export default grup_cont;