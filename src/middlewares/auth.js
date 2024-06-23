import jwt from "jsonwebtoken";
import hist_login from "../models/hist/hist_login_model";
const Sequelize = require("sequelize");
import sq from "../db";
require("dotenv").config();
const { JWT_SECRET_KEY } = process.env;

export const is_login = async (req, res, next) => {
  try {
    const auth_header = req.headers.authorization;
    const token = auth_header && auth_header.split(" ")[1];
    if (!token) throw new Error("Token not found");
    const token_login = await hist_login.findOne({ where: { token } });
    if (!token_login) throw new Error("Token not found");
    const decoded_data = jwt.verify(token, JWT_SECRET_KEY);
    delete decoded_data.exp;
    delete decoded_data.iat;

    const oto_menu = await sq.query(`SELECT * FROM get_oto_menu('${decoded_data.mygrup}')`, { type: Sequelize.QueryTypes.SELECT });
    // group by grup menu with program
    const grup_menu = await sq.query(`SELECT * FROM get_grup_menu('${decoded_data.mygrup}')`, { type: Sequelize.QueryTypes.SELECT });
    const oto_report = await sq.query(`select * from get_oto_report('${decoded_data.mygrup}')`, { type: Sequelize.QueryTypes.SELECT });
    // get menu name from url
    const url = req.query.path;
    const cek_menu = await sq.query(`SELECT open, add, update, cancel, accept, backdate FROM cari_oto_menu WHERE linkmenu = '${url}' and grup = '${decoded_data.mygrup}' and aktif = 't'`, { type: Sequelize.QueryTypes.SELECT });

    req.user = { ...decoded_data, oto_menu, oto_report, cek_menu: cek_menu[0] || {}, grup_menu: grup_menu || {} };
    next();
  } catch (e) {
    if (e.message == "jwt expired") return res.status(401).json({ message: "Token expired", error: true });
  }
};
