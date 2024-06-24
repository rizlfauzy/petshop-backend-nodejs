import model from "../models/modular_model";
import { fn, col, where } from "sequelize";

const generate_kode = async (name, kode, field, length, first, pad_length) => {
  try {
    const data = await model[name].findOne({
      attributes: [[fn("MAX", col(field)), field]],
      where: where(fn("LEFT", col(field), length), kode),
    });
    if (!data[field]) return kode + first;
    let last_digit = Number(data[field].substr(length));
    last_digit++;
    return kode + last_digit.toString().padStart(pad_length, "0");
  } catch (e) {
    return kode + first;
  }
};

export default generate_kode;
