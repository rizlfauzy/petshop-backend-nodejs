import sales from "../../models/api/sales_model";
import so_barang from "../../models/api/sales_barang_model";
import cari_sales from "../../models/api/cari_sales";
import inventory_barang from "../../models/api/inventory_barang_model";
import sq from "../../db";
import moment from "moment";
import generate_kode from "../../utils/generate_kode";
import month_diff from "../../utils/month_diff";
import fs from "fs";
import { options_pdf } from "../../utils/options";
import pdf from "pdf-creator-node";
import { format_rupiah, deformat_rupiah } from "../../utils/format";
import compile_hbs from "../../utils/compile_hbs";
import path from "path";
require("dotenv").config();
const { APP_URL } = process.env;
moment.tz.setDefault("Asia/Jakarta");

const sales_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { nomor } = req.query;
      const data = await sales.findOne({ attributes: ["nomor", "tanggal", "keterangan"], where: { nomor } }, { transaction });
      const detail = await cari_sales.findAll({ attributes: ["barcode", "nama_barang", "stock", "qty", "harga", "disc", "nilai_disc", "total"], where: { nomor } }, { transaction });
      data.setDataValue("list_barang", detail);
      await transaction.commit();
      return res.status(200).json({ data, message: "Data berhasil didapatkan !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  print: async (req, res) => {
    const transaction = await sq.transaction()
    const path_file = "./public/pdf/";
    try {
      const { nomor } = req.query;
      const name_file = "faktur-" + nomor + "-" + moment().format("YYYYMMDDHHmmss") + ".pdf";
      const data = await sales.findOne({ attributes: ["nomor", "tanggal", "keterangan"], where: { nomor } }, { transaction });
      const detail = await cari_sales.findAll({ attributes: ["barcode", "nama_barang", "stock", "qty", "harga", "disc", "nilai_disc", "total"], where: { nomor } }, { transaction });
      const data_detail = JSON.parse(JSON.stringify(detail)).map((item, i) => ({ ...item, harga: format_rupiah(item.harga), nilai_disc: format_rupiah(item.nilai_disc), total: format_rupiah(item.total), no: i + 1 }));

      data.setDataValue("list_barang", data_detail);
      data.setDataValue("waktu_cetak", moment().format("HH:mm:ss"));
      data.setDataValue("grand_total", format_rupiah(data_detail.reduce((acc, curr) => acc + Number(deformat_rupiah(curr.total)), 0)));
      if (!fs.existsSync("./public/")) fs.mkdirSync("./public/");
      if (!fs.existsSync(path_file)) fs.mkdirSync(path_file);
      // const html = compile_hbs("invoice_penjualan", { sales: data.toJSON() });
      const html = fs.readFileSync(path.join(__dirname, "../../templates/invoice_penjualan.html"), "utf8");
      const document = {
        html,
        data: { sales: data.toJSON() },
        path: path_file + name_file,
      };
      await pdf.create(document, options_pdf);
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
      const nomor = await generate_kode("penjualan", `IN-${moment().format("YYYY-MM")}-`, "nomor", 11, `0001`, 4);
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
              const data_update_stock = i == 0 ? { qty_keluar: Number(stock.qty_keluar) + Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            } else {
              const data_insert_stock = i == 0 ? { qty_keluar: Number(barang.qty), qty_awal: 0 } : { qty_awal, qty_keluar: 0 };
              await inventory_barang.create({
                ...data_insert_stock,
                barcode: barang.barcode,
                periode: periode_stock,
                qty_masuk: 0,
                tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
                pemakai: req.user.myusername.toUpperCase(),
              });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_keluar: Number(stock.qty_keluar) + Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          } else {
            await inventory_barang.create({
              qty_awal: 0,
              qty_masuk: 0,
              qty_keluar: Number(barang.qty),
              barcode: barang.barcode,
              periode,
              tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
              pemakai: req.user.myusername.toUpperCase(),
            });
          }
        }
      }

      await sales.create({ nomor, tanggal: moment(tanggal).format("YYYY-MM-DD"), keterangan: keterangan.toUpperCase(), pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });

      for (const barang of list_barang) {
        await so_barang.create(
          {
            nomor,
            barcode: barang.barcode,
            qty: barang.qty,
            harga: barang.harga,
            disc: barang.disc,
            nilai_disc: barang.nilai_disc,
            total: barang.total_harga,
            pemakai: req.user.myusername,
            tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
          },
          { transaction }
        );
      }
      await transaction.commit();
      return res.status(201).json({ message: "Data berhasil disimpan !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const list_barang = JSON.parse(req.body.list_barang);
      const { nomor, tanggal, keterangan } = req.body;
      const periode = moment().format("YYYYMM");

      const detail = await cari_sales.findAll({ attributes: ["barcode", "qty", "nama_barang", "tanggal"], where: { nomor } }, { transaction });
      for (const barang of detail) {
        const first_date = moment(barang.tanggal).startOf("month").format("YYYY-MM-DD");
        const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
        if (selisih_bulan > 0) {
          let qty_awal = 0;
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
            if (stock) {
              const data_update_stock = i == 0 ? { qty_keluar: Number(stock.qty_keluar) - Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_keluar: Number(stock.qty_keluar) - Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
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
              const data_update_stock = i == 0 ? { qty_keluar: Number(stock.qty_keluar) + Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_keluar: Number(stock.qty_keluar) + Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          }
        }
      }

      await sales.update(
        { tanggal: moment(tanggal).format("YYYY-MM-DD"), keterangan: keterangan.toUpperCase(), pemakai: req.user.myusername.toUpperCase(), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss") },
        { where: { nomor }, transaction }
      );

      await so_barang.destroy({ where: { nomor }, transaction });

      for (const barang of list_barang) {
        await so_barang.create(
          {
            nomor,
            barcode: barang.barcode,
            qty: barang.qty,
            harga: barang.harga,
            disc: barang.disc,
            nilai_disc: barang.nilai_disc,
            total: barang.total_harga,
            pemakai: req.user.myusername,
            tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
          },
          { transaction }
        );
      }
      await transaction.commit();
      return res.status(201).json({ message: "Data berhasil diubah !!!", error: false });
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
      const header = await sales.findOne({ attributes: ["tanggal"], where: { nomor } }, { transaction });
      const detail = await cari_sales.findAll({ attributes: ["barcode", "qty", "nama_barang", "tanggal"], where: { nomor } }, { transaction });

      const first_date = moment(header.tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of detail) {
        if (selisih_bulan > 0) {
          let qty_awal = 0;
          for (let i = 0; i <= selisih_bulan; i++) {
            const periode_stock = moment(first_date).add(i, "months").format("YYYYMM");
            const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
            if (stock) {
              const data_update_stock = i == 0 ? { qty_keluar: Number(stock.qty_keluar) - Number(barang.qty) } : { qty_awal };
              await inventory_barang.update({ ...data_update_stock, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() }, { where: { barcode: barang.barcode, periode: periode_stock } });
              const stock_now = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode: periode_stock } }, { transaction });
              qty_awal = Number(stock_now.qty_awal) + Number(stock_now.qty_masuk) - Number(stock_now.qty_keluar);
            }
          }
        } else {
          const stock = await inventory_barang.findOne({ where: { barcode: barang.barcode, periode } }, { transaction });
          if (stock) {
            await inventory_barang.update(
              { qty_keluar: Number(stock.qty_keluar) - Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          }
        }
      }

      await sales.update({ batal: true, tglbatal: moment().format("YYYY-MM-DD HH:mm:ss"), keteranganbatal: alasan, pemakai: req.user.myusername.toUpperCase() }, { where: { nomor }, transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Data berhasil dibatalkan !!!", error: false });
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default sales_cont;
