import CryptoJS from "crypto-js";
require("dotenv").config();

const { ENC_KEY } = process.env;

export const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, ENC_KEY).toString();
}

export const decrypt = (text) => {
  return CryptoJS.AES.decrypt(text, ENC_KEY).toString(CryptoJS.enc.Utf8);
}