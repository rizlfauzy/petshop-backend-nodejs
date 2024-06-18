import jwt from "jsonwebtoken";
import sq from "../../db.js";
import login_model from "../../models/api/login";
import hist_login_model from "../../models/hist/hist_login";
import konfigurasi_model from "../../models/api/konfigurasi";
import moment from "moment";
require("dotenv").config();
const { JWT_SECRET_KEY } = process.env;
let auth = {};

auth.login = async (req, res) => {
  const trans = await sq.transaction();
  try {
    const { username } = req.body;

    const user = await login_model.findOne({ where: { username: username.toUpperCase() } }, { transaction: trans });
    const konf = await konfigurasi_model.findOne({ where: { kodetoko: user.kodetoko } }, { transaction: trans });
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

    await hist_login_model.create(
      {
        token,
        pemakai: username,
        tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      { transaction: trans }
    );

    // req.session.myusername = username;
    // req.session.mygrup = user.grup;
    // req.session.mycabang = user.kodetoko;
    // req.session.tglawal_periode = konf.tglawal;
    // req.session.tglakhir_periode = konf.tglakhir;
    // req.session.kodeharga = konf.kodeharga;
    // req.session.toko_bb = konf.toko_bb;
    // req.session.token = token;

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
};

export default auth;
