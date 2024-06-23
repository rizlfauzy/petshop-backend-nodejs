import jwt from "jsonwebtoken";
import sq from "../../db.js";
import login from "../../models/api/login_model.js";
import hist_login from "../../models/hist/hist_login_model.js";
import konfigurasi from "../../models/api/konfigurasi_model.js";
import moment from "moment";
require("dotenv").config();
const { JWT_SECRET_KEY } = process.env;

const auth = {
  login: async (req, res) => {
    const trans = await sq.transaction();
    try {
      const { username } = req.body;

      const user = await login.findOne({ where: { username: username.toUpperCase() } }, { transaction: trans });
      const konf = await konfigurasi.findOne({ where: { kodetoko: user.kodetoko } }, { transaction: trans });
      const token = jwt.sign(
        {
          myusername: username,
          mygrup: user.grup,
          mycabang: user.kodetoko,
          tglawal_periode: konf.tglawal,
          tglakhir_periode: konf.tglakhir,
          kodeharga: konf.kodeharga,
          toko_bb: konf.toko_bb,
        },
        JWT_SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      await hist_login.create(
        {
          token,
          pemakai: username,
          tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        { transaction: trans }
      );

      await trans.commit();

      return res.status(200).json({
        message: "Berhasil masuk ke halaman utama",
        error: false,
        token,
      });
    } catch (e) {
      await trans.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  logout: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { token } = req.body;
      await hist_login.destroy({ where: { token } }, { transaction });
      req.user = null;
      await transaction.commit();
      return res.status(200).json({ message: "Berhasil keluar dari sistem", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default auth;
