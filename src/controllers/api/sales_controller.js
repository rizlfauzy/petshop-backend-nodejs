import sales from "../../models/api/sales_model";
import so_barang from "../../models/api/sales_barang_model";
import cari_sales from "../../models/api/cari_sales";
import inventory_barang from "../../models/api/inventory_barang_model";
import sq from "../../db";
import moment from "moment";
import generate_kode from "../../utils/generate_kode";
import month_diff from "../../utils/month_diff";
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
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  save: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const list_barang = JSON.parse(req.body.list_barang);
      const { tanggal, keterangan } = req.body;
      const nomor = await generate_kode("penjualan", `IN-${moment().format("YYYY-MM")}-`, "nomor", 11, `00001`, 5);
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
              { where: { barcode: barang.barcode, periode }, transaction }
            );
          } else {
            await inventory_barang.create(
              {
                qty_awal: 0,
                qty_masuk: 0,
                qty_keluar: Number(barang.qty),
                barcode: barang.barcode,
                periode,
                tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
                pemakai: req.user.myusername.toUpperCase(),
              },
              {
                transaction,
              }
            );
          }
        }
      }

      await sales.create({ nomor, tanggal: moment(tanggal).format("YYYY-MM-DD"), keterangan, pemakai: req.user.myusername, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });

      for (const barang of list_barang) {
        await so_barang.create(
          {
            nomor,
            barcode: barang.barcode,
            qty: barang.qty,
            harga: barang.harga_jual,
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
};

export default sales_cont;
