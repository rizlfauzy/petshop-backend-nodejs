import barang_rusak from "../../models/api/barang_rusak_model";
import barang_rusak_detail from "../../models/api/barang_rusak_detail_model";
import cari_barang_rusak from "../../models/api/cari_barang_rusak";
import inventory_barang from "../../models/api/inventory_barang_model";
import sq from "../../db";
import moment from "moment";
import generate_kode from "../../utils/generate_kode";
import month_diff from "../../utils/month_diff";
moment.tz.setDefault("Asia/Jakarta");

const barang_rusak_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { nomor } = req.query;
      const data = await barang_rusak.findOne({ attributes: ["nomor", "tanggal", "keterangan", "is_approved"], where: { nomor }, transaction });
      const detail = await cari_barang_rusak.findAll({ attributes: ["barcode", "nama_barang", "stock", "qty", "harga", "total"], where: { nomor } }, { transaction });
      data.setDataValue("list_barang", detail);
      await transaction.commit();
      return res.status(200).json({ data, message: "Data berhasil didapatkan !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      console.log({e});
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  approve: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      // const list_barang = JSON.parse(req.body.list_barang);
      const list_barang = await cari_barang_rusak.findAll({ attributes: ["barcode", "qty", "nama_barang", "tanggal"], where: { nomor: req.body.nomor } }, { transaction });
      const { tanggal, keterangan, nomor } = req.body;
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

      await barang_rusak.update({ is_approved: true }, { where: { nomor }, transaction });

      await transaction.commit();
      return res.status(201).json({ message: "Barang Rusak berhasil diapprove !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  reject: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { alasan, nomor } = req.body;

      await barang_rusak.update({ batal: true, tglbatal: moment().format("YYYY-MM-DD HH:mm:ss"), keteranganbatal: alasan, pemakai: req.user.myusername.toUpperCase() }, { where: { nomor }, transaction });

      await transaction.commit();
      return res.status(201).json({ message: "Barang Rusak berhasil direject !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  save: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const list_barang = JSON.parse(req.body.list_barang);
      const { tanggal, keterangan } = req.body;
      const nomor = await generate_kode("barang_rusak", `BR-${moment().format("YYYY-MM")}-`, "nomor", 11, `0001`, 4);

      await barang_rusak.create({ nomor, tanggal: moment(tanggal).format("YYYY-MM-DD"), keterangan, pemakai: req.user.myusername, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"), is_approved: false }, { transaction });

      await barang_rusak_detail.bulkCreate(
        list_barang.map((barang) => ({
          nomor,
          barcode: barang.barcode,
          qty: barang.qty,
          harga: barang.harga,
          total: barang.total_harga,
          pemakai: req.user.myusername,
          tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
        })),
        { transaction }
      );

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

      const detail = await cari_barang_rusak.findAll({ attributes: ["barcode", "qty", "nama_barang", "tanggal"], where: { nomor } }, { transaction });
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

      await barang_rusak.update({ tanggal: moment(tanggal).format("YYYY-MM-DD"), keterangan, pemakai: req.user.myusername, tglupdate: moment().format("YYYY-MM-DD HH:mm:ss") }, { where: { nomor }, transaction });

      await barang_rusak_detail.destroy({ where: { nomor }, transaction });

      for (const barang of list_barang) {
        await barang_rusak_detail.create(
          {
            nomor,
            barcode: barang.barcode,
            qty: barang.qty,
            harga: barang.harga,
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
      const header = await barang_rusak.findOne({ attributes: ["tanggal"], where: { nomor } }, { transaction });
      const detail = await cari_barang_rusak.findAll({ attributes: ["barcode", "qty", "nama_barang", "tanggal"], where: { nomor } }, { transaction });

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

      await barang_rusak.update({ batal: true, tglbatal: moment().format("YYYY-MM-DD HH:mm:ss"), keteranganbatal: alasan, pemakai: req.user.myusername.toUpperCase() }, { where: { nomor }, transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Data berhasil dibatalkan !!!", error: false });
    } catch (e) {
      return res.status(500).json({ message: e.message, error: true });
    }
  },
};

export default barang_rusak_cont;