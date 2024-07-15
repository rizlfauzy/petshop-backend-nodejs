import order from "../../models/api/order_model";
import order_detail from "../../models/api/order_detail_model";
import cari_pembelian from "../../models/api/cari_order";
import inventory_barang from "../../models/api/inventory_barang_model";
import generate_kode from "../../utils/generate_kode";
import month_diff from "../../utils/month_diff";
import moment from "moment-timezone";
import sq from "../../db";
import fs from "fs";
import { options_invoice } from "../../utils/options";
import pdf from "pdf-creator-node";
import { format_rupiah, deformat_rupiah } from "../../utils/format";
import compile_hbs from "../../utils/compile_hbs";
require("dotenv").config();
const { APP_URL } = process.env;
moment.tz.setDefault("Asia/Jakarta");

const order_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { nomor } = req.query;
      const data = await order.findOne({ attributes: ["nomor", "tanggal", "keterangan"], where: { nomor } }, { transaction });
      const detail = await cari_pembelian.findAll({ attributes: ["barcode", "nama_barang", "stock", "qty", "harga", "total"], where: { nomor } }, { transaction });
      data.setDataValue("list_barang", detail);
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil didapatkan !!!", data });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message });
    }
  },
  print: async (req, res) => {
    const transaction = await sq.transaction();
    const path_file = "./public/pdf/";
    try {
      const { nomor } = req.query;
      const name_file = "penerimaan-barang-" + nomor + "-" + moment().format("YYYYMMDDHHmmss") + ".pdf";
      const data = await order.findOne({ attributes: ["nomor", "tanggal", "keterangan"], where: { nomor } }, { transaction });
      const detail = await cari_pembelian.findAll({ attributes: ["barcode", "nama_barang", "qty", "harga", "total"], where: { nomor } }, { transaction });
      const data_detail = JSON.parse(JSON.stringify(detail)).map((item, i) => ({ ...item, harga: format_rupiah(item.harga), total: format_rupiah(item.total), no: i + 1 }));

      data.setDataValue("list_barang", data_detail);
      data.setDataValue("waktu_cetak", moment().format("HH:mm:ss"));
      data.setDataValue("grand_total", format_rupiah(data_detail.reduce((acc, curr) => acc + Number(deformat_rupiah(curr.total)), 0)));
      if (!fs.existsSync("./public/")) fs.mkdirSync("./public/");
      if (!fs.existsSync(path_file)) fs.mkdirSync(path_file);
      const html = compile_hbs("invoice_pembelian", { order: data.toJSON() });
      const document = {
        html,
        data: { order: data.toJSON() },
        path: path_file + name_file,
      };
      await pdf.create(document, options_invoice);
      await transaction.commit();
      setTimeout(() => {
        fs.unlinkSync(path_file + name_file);
      }, 1500);
      return res.status(200).json({ data, message: "Data berhasil didapatkan !!!", error: false, url: `${APP_URL}/pdf/${name_file}` });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true, data });
    }
  },
  save: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const list_barang = JSON.parse(req.body.list_barang);
      const { tanggal, keterangan } = req.body;
      const nomor = await generate_kode("pembelian", `PB-${moment().format("YYYY-MM")}-`, "nomor", 11, `00001`, 5);
      const periode = moment().format("YYYYMM");

      const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of list_barang) {
        if (selisih_bulan > 0) {
          let qty_awal = 0;
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
            if (stock) {
              const data_update_stock = i == 0 ? { qty_masuk: Number(stock.qty_masuk) + Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            } else {
              const data_insert_stock = i == 0 ? { qty_masuk: Number(barang.qty), qty_awal: 0 } : { qty_awal, qty_masuk: 0 };
              await inventory_barang.create({
                ...data_insert_stock,
                periode: periode_stock,
                barcode: barang.barcode,
                qty_keluar: 0,
                pemakai: req.user.myusername.toUpperCase(),
                tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
              });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_masuk: Number(stock.qty_masuk) + Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          } else {
            await inventory_barang.create({
              periode,
              barcode: barang.barcode,
              qty_awal: 0,
              qty_masuk: Number(barang.qty),
              qty_keluar: 0,
              pemakai: req.user.myusername.toUpperCase(),
              tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
            });
          }
        }
      }

      await order.create({ nomor, tanggal: moment(tanggal).format("YYYY-MM-DD"), keterangan: keterangan.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { transaction });

      for (const barang of list_barang) {
        const { barcode, qty, harga, total_harga: total } = barang;
        await order_detail.create({ nomor, barcode, qty, harga, total, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { transaction });
      }
      await transaction.commit();
      return res.status(200).json({ message: "Pembelian berhasil !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const list_barang = JSON.parse(req.body.list_barang);
      const { tanggal, keterangan, nomor } = req.body;
      const periode = moment().format("YYYYMM");

      const detail = await cari_pembelian.findAll({ attributes: ["barcode", "tanggal", "nama_barang", "stock", "qty", "harga", "total"], where: { nomor } }, { transaction });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          let qty_awal = 0;
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
            if (stock) {
              const data_update_stock = i == 0 ? { qty_masuk: Number(stock.qty_masuk) - Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_masuk: Number(stock.qty_masuk) - Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          }
        }
      }
      const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of list_barang) {
        if (selisih_bulan > 0) {
          let qty_awal = 0;
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
            if (stock) {
              const data_update_stock = i == 0 ? { qty_masuk: Number(stock.qty_masuk) + Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            } else {
              const data_insert_stock = i == 0 ? { qty_masuk: Number(barang.qty), qty_awal: 0 } : { qty_awal, qty_masuk: 0 };
              await inventory_barang.create({
                ...data_insert_stock,
                periode: periode_stock,
                barcode: barang.barcode,
                qty_keluar: 0,
                pemakai: req.user.myusername.toUpperCase(),
                tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
              });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_masuk: Number(stock.qty_masuk) + Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          } else {
            await inventory_barang.create({
              periode,
              barcode: barang.barcode,
              qty_awal: 0,
              qty_masuk: Number(barang.qty),
              qty_keluar: 0,
              pemakai: req.user.myusername.toUpperCase(),
              tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
            });
          }
        }
      }

      await order_detail.destroy({ where: { nomor }, transaction });

      for (const barang of list_barang) {
        const { barcode, qty, harga, total_harga: total } = barang;
        await order_detail.create({ nomor, barcode, qty, harga, total, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { transaction });
      }

      await order.update(
        { tanggal: moment(tanggal).tz("Asia/Jakarta").format("YYYY-MM-DD"), keterangan: keterangan.toUpperCase(), tglupdate: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
        { where: { nomor }, transaction }
      );

      await transaction.commit();
      return res.status(200).json({ message: "Pembelian berhasil diupdate !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  cancel: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { nomor, alasan } = req.body;
      const periode = moment().format("YYYYMM");
      const header = await order.findOne({ attributes: ["nomor", "tanggal"], where: { nomor } }, { transaction });
      const detail = await cari_pembelian.findAll({ attributes: ["barcode", "tanggal", "nama_barang", "stock", "qty", "harga", "total"], where: { nomor } }, { transaction });

      const first_date = moment(header.tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of detail) {
        if (selisih_bulan > 0) {
          let qty_awal = 0;
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
            if (stock) {
              const data_update_stock = i == 0 ? { qty_masuk: Number(stock.qty_masuk) - Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_masuk: Number(stock.qty_masuk) - Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          }
        }
      }

      await order.update({ batal: true, tglbatal: moment().format("YYYY-MM-DD HH:mm:ss"), keteranganbatal: alasan, pemakai: req.user.myusername.toUpperCase() }, { where: { nomor }, transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Pembelian berhasil dibatalkan !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default order_cont;
