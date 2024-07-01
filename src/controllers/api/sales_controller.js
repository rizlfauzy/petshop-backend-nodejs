import sales from "../../models/api/sales_model";
import so_barang from "../../models/api/sales_barang_model";
import sq from "../../db";

const sales_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await sales.findOne({ attributes: ["nomor", "tanggal", "keterangan"], where: { nomor } }, { transaction });
      const detail = await so_barang.findAll({ where: { nomor } }, { transaction });
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  }
}