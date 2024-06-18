import jwt from "jsonwebtoken";
import hist_login_model from "../models/hist/hist_login";
import sq from "../db";
require("dotenv").config();
const { JWT_SECRET_KEY } = process.env;

export const is_login = async (req, res, next) => {
  try {
    const auth_header = req.headers.authorization;
    const token = auth_header && auth_header.split(" ")[1];
    if (!token) throw new Error("Token not found");
    const token_login = await hist_login_model.findOne({ where: { token } });
    if (!token_login) throw new Error("Token not found");
    const decoded_data = jwt.verify(token, JWT_SECRET_KEY);
    delete decoded_data.exp;
    delete decoded_data.iat;

    const [oto_menu] = await sq.query(`SELECT om.*, m.namamenu, m.linkmenu, m.nourut, m.urut_global, m.iconmenu FROM oto_menu om left join menu m on om.nomenu = m.nomenu  WHERE om.grup = '${decoded_data.mygrup}' and om.open = 't' order by m.urut_global asc`);
    const [oto_report] = await sq.query(`SELECT
        DISTINCT r.kodegrup,
        gr.nama,
        ore.grup,
        gr.pos
      FROM
          oto_report ore
          LEFT JOIN report r on ore.report = r.kode
          left join grup_report gr on r.kodegrup = gr.kode
      WHERE
          ore.grup = '${decoded_data.mygrup}'
          and gr.aktif = 't'
      order by
          gr.pos asc`);
    // get menu name from url
    const url = req.query.path;
    const [cek_menu] = await sq.query(`SELECT open, add, update, cancel, accept, backdate FROM cari_oto_menu WHERE linkmenu = '${url}' and grup = '${decoded_data.mygrup}' and aktif = 't'`);

    req.user = {...decoded_data, oto_menu, oto_report, cek_menu: cek_menu[0] || {}};
    next();
  } catch (e) {
    if (e.message == 'jwt expired') return res.status(401).json({ message: "Token expired", error: true });
  }
}