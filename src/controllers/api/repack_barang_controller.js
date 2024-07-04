import repack_barang from "../../models/api/repack_barang_model"
import repack_barang_detail from "../../models/api/repack_barang_detail_model"
import cari_repack_barang from "../../models/api/cari_repack_barang"
import inventory_barang from "../../models/api/inventory_barang_model"
import sq from "../../db"
import moment from "moment"
import generate_kode from "../../utils/generate_kode"
import month_diff from "../../utils/month_diff"
moment.tz.setDefault("Asia/Jakarta");

const repack_barang_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { nomor } = req.query;
      const data = await repack_barang.findOne({ attributes: ["nomor", "tanggal", "keterangan"], where: { nomor } }, { transaction });
      const detail = await cari_repack_barang.findAll({ attributes: ["barcode", "nama_barang", "stock", "qty", "jenis"], where: { nomor } }, { transaction });
      data.setDataValue("list_barang", detail);
      await transaction.commit();
      return res.status(200).json({ data, message: "Data berhasil didapatkan !!!", error: false });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  }
}

export default repack_barang_cont;