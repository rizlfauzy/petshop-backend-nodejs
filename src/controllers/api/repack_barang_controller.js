import repack_barang from "../../models/api/repack_barang_model";
import repack_barang_detail from "../../models/api/repack_barang_detail_model";
import cari_repack_barang from "../../models/api/cari_repack_barang";
import inventory_barang from "../../models/api/inventory_barang_model";
import sq from "../../db";
import moment from "moment";
import generate_kode from "../../utils/generate_kode";
import month_diff from "../../utils/month_diff";
moment.tz.setDefault("Asia/Jakarta");

const repack_barang_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { nomor } = req.query;
      const data = await repack_barang.findOne({ attributes: ["nomor", "tanggal", "keterangan"], where: { nomor } }, { transaction });
      const detail = await cari_repack_barang.findAll({ attributes: ["barcode", "nama_barang", "stock", "qty", "jenis"], where: { nomor } }, { transaction });
      data.setDataValue("list_barang", detail);
      await transaction.commit();
      return res.status(200).json({ data, message: "Data berhasil didapatkan !!!", error: false });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  save: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const list_barang_proses = JSON.parse(req.body.list_barang_proses);
      const list_barang_hasil = JSON.parse(req.body.list_barang_hasil);
      const { tanggal, keterangan } = req.body;
      const nomor = await generate_kode("repack_barang", `RB-${moment().format("YYYY-MM")}-`, "nomor", 11, `0001`, 4);
      const periode = moment().format("YYYYMM");

      const first_date = moment(tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of list_barang_proses) {
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

      for (const barang of list_barang_hasil) {
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
                barcode: barang.barcode,
                periode: periode_stock,
                qty_keluar: 0,
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
              { qty_masuk: Number(stock.qty_masuk) + Number(barang.qty), tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
              { where: { barcode: barang.barcode, periode } }
            );
          } else {
            await inventory_barang.create({
              qty_awal: 0,
              qty_keluar: 0,
              qty_masuk: Number(barang.qty),
              barcode: barang.barcode,
              periode,
              tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
              pemakai: req.user.myusername.toUpperCase(),
            });
          }
        }
      }

      await repack_barang.create({ nomor, tanggal: moment(tanggal).format("YYYY-MM-DD"), keterangan, pemakai: req.user.myusername.toUpperCase(), tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });

      for (const barang of list_barang_proses) {
        await repack_barang_detail.create({ nomor, barcode: barang.barcode, qty: barang.qty, jenis: "proses", pemakai: req.user.myusername, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });
      }

      for (const barang of list_barang_hasil) {
        await repack_barang_detail.create({ nomor, barcode: barang.barcode, qty: barang.qty, jenis: "hasil", pemakai: req.user.myusername, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });
      }

      await transaction.commit();
      return res.status(200).json({ message: "Data berhasil disimpan !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const list_barang_proses = JSON.parse(req.body.list_barang_proses);
      const list_barang_hasil = JSON.parse(req.body.list_barang_hasil);
      const { tanggal, keterangan, nomor } = req.body;
      const periode = moment().format("YYYYMM");

      const detail_proses = await cari_repack_barang.findAll({ attributes: ["barcode", "qty", "tanggal", "nama_barang"], where: { nomor, jenis: "proses" } }, { transaction });
      const detail_hasil = await cari_repack_barang.findAll({ attributes: ["barcode", "qty", "tanggal", "nama_barang"], where: { nomor, jenis: "hasil" } }, { transaction });

      for (const barang of detail_proses) {
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

      for (const barang of detail_hasil) {
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

      for (const barang of list_barang_proses) {
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

      for (const barang of list_barang_hasil) {
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

      await repack_barang_detail.destroy({ where: { nomor } }, { transaction });

      for (const barang of list_barang_proses) {
        await repack_barang_detail.create({ nomor, barcode: barang.barcode, qty: barang.qty, jenis: "proses", pemakai: req.user.myusername, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });
      }

      for (const barang of list_barang_hasil) {
        await repack_barang_detail.create({ nomor, barcode: barang.barcode, qty: barang.qty, jenis: "hasil", pemakai: req.user.myusername, tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss") }, { transaction });
      }

      await repack_barang.update(
        { tanggal: moment(tanggal).tz("Asia/Jakarta").format("YYYY-MM-DD"), keterangan, tglupdate: moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"), pemakai: req.user.myusername.toUpperCase() },
        { where: { nomor }, transaction }
      );

      await transaction.commit();
      return res.status(200).json({ message: "Data berhasil diupdate !!!", error: false });
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
      const header = await repack_barang.findOne({ attributes: ["tanggal", "nomor"], where: { nomor } }, { transaction });
      const detail_proses = await cari_repack_barang.findAll({ attributes: ["barcode", "qty", "tanggal", "nama_barang"], where: { nomor, jenis: "proses" } }, { transaction });
      const detail_hasil = await cari_repack_barang.findAll({ attributes: ["barcode", "qty", "tanggal", "nama_barang"], where: { nomor, jenis: "hasil" } }, { transaction });

      const first_date = moment(header.tanggal).startOf("month").format("YYYY-MM-DD");
      const selisih_bulan = month_diff(moment(first_date).format("YYYYMM"), periode);
      for (const barang of detail_proses) {
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

      for (const barang of detail_hasil) {
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

      await repack_barang.update({ batal: true, tglbatal: moment().format("YYYY-MM-DD HH:mm:ss"), keteranganbatal: alasan, pemakai: req.user.myusername.toUpperCase() }, { where: { nomor }, transaction });

      await transaction.commit();
      return res.status(200).json({ message: "Data berhasil dihapus !!!", error: false });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  }
};

export default repack_barang_cont;
