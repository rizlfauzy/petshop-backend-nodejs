import login from "../../models/api/login_model";
import sq from "../../db";
import { encrypt, decrypt } from "../../utils/encrypt";

const password_cont = {
  show: async (req, res) => {
    try {
      const user = await login.findOne({ where: { username: req.user.myusername.toUpperCase() } });
      const pass = decrypt(user.password);
      return res.status(200).json({ message: "dapat data password", error: false, data: { username: req.user.myusername.toUpperCase(), password: pass } });
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { password } = req.body;
      const enc_pass = encrypt(password);
      const user = await login.findOne({ where: { username: req.user.myusername.toUpperCase() } }, { transaction });
      user.password = enc_pass;
      await user.save();
      await transaction.commit();
      return res.status(200).json({ message: "Berhasil mengubah password", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default password_cont;
