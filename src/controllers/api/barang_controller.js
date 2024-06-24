import barang from "../../models/api/barang_model";
import cari_barang_view from "../../models/api/cari_barang_model";
import sq from "../../db";
import moment from "moment";
moment.locale("id");

const barang_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { barcode } = req.query;
      const data = await cari_barang_view.findOne({ where: { barcode: barcode.toUpperCase() }, transaction });
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
      const { barcode, nama, satuan, kategori, min_stock, disc, harga_jual, harga_modal, keterangan } = req.body;
      await barang.create({ barcode, nama, satuan, kategori, min_stock, disc, harga_jual, harga_modal, keterangan, aktif: true, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });
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
      const { barcode, nama, satuan, kategori, min_stock, disc, harga_jual, harga_modal, keterangan, aktif } = req.body;
      await barang.update(
        { nama, satuan, kategori, min_stock, disc, harga_jual, harga_modal, keterangan, aktif, pemakai: req.user.myusername.toUpperCase(), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss") },
        { where: { barcode }, transaction }
      );
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil diubah" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
}

export default barang_cont;