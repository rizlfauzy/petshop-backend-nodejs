import informasi_model from "../../models/api/informasi";
import sq from "../../db";
let info = {}

info.index = async (req, res) => {
  const transaction = await sq.transaction();
  try {
    const data = await informasi_model.findOne({attributes: ["info"], order: [["id", "DESC"]] }, { transaction });
    await transaction.commit();
    return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
  } catch (e) {
    await transaction.rollback();
    return res.status(500).json({ message: e.message, error: true });
  }
}

export default info;