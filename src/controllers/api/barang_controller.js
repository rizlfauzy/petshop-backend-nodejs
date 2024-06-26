import barang from "../../models/api/barang_model";
import cari_barang_view from "../../models/api/cari_barang_model";
import inventory_barang from "../../models/api/inventory_barang_model";
import sq from "../../db";
import moment from "moment";
import { clear_char, clear_alphabet } from "../../utils/clear";
import excelJS from "exceljs";
import fs from "fs";
moment.locale("id");

const barang_cont = {
  one: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { barcode } = req.query;
      const data = await cari_barang_view.findOne({ where: { barcode: barcode.toUpperCase() }, transaction });
      await transaction.commit();
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  all: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const data = await cari_barang_view.findAll({ transaction });
      await transaction.commit();
      return res.status(200).json({ data, error: false, message: "Data berhasil diambil" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  save: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { barcode, nama, kode_satuan: satuan, kode_kategori: kategori, min_stock, disc, harga_jual, harga_modal, keterangan } = req.body;
      await barang.create(
        {
          barcode: barcode.toUpperCase(),
          nama: nama.toUpperCase(),
          satuan,
          kategori,
          min_stock: clear_alphabet(clear_char(min_stock)),
          disc: clear_alphabet(clear_char(disc)),
          harga_jual: clear_alphabet(clear_char(harga_jual)),
          harga_modal: clear_alphabet(clear_char(harga_modal)),
          keterangan: keterangan ? keterangan.toUpperCase() : "",
          aktif: true,
          pemakai: req.user.myusername.toUpperCase(),
          tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        { transaction }
      );
      await inventory_barang.create(
        {
          periode: moment().format("YYYYMM"),
          barcode: barcode.toUpperCase(),
          qty_awal: 0,
          qty_masuk: 0,
          qty_keluar: 0,
          pemakai: req.user.myusername.toUpperCase(),
          tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        { transaction }
      );
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil disimpan" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  update: async (req, res) => {
    const transaction = await sq.transaction();
    try {
      const { barcode, nama, kode_satuan: satuan, kode_kategori: kategori, min_stock, disc, harga_jual, harga_modal, keterangan, aktif } = req.body;
      await barang.update(
        {
          nama: nama.toUpperCase(),
          satuan,
          kategori,
          min_stock: clear_alphabet(clear_char(min_stock)),
          disc: clear_alphabet(clear_char(disc)),
          harga_jual: clear_alphabet(clear_char(harga_jual)),
          harga_modal: clear_alphabet(clear_char(harga_modal)),
          keterangan: keterangan ? keterangan.toUpperCase() : "",
          aktif,
          pemakai: req.user.myusername.toUpperCase(),
          tglupdate: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        { where: { barcode: barcode.toUpperCase() }, transaction }
      );
      const check_stock = await inventory_barang.findOne({ where: { barcode: barcode.toUpperCase(), periode: moment().format("YYYYMM") }, transaction });
      if (!check_stock) {
        await inventory_barang.create(
          {
            periode: moment().format("YYYYMM"),
            barcode: barcode.toUpperCase(),
            qty_awal: 0,
            qty_masuk: 0,
            qty_keluar: 0,
            pemakai: req.user.myusername.toUpperCase(),
            tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
          },
          { transaction }
        );
      }
      await transaction.commit();
      return res.status(200).json({ error: false, message: "Data berhasil diubah" });
    } catch (e) {
      await transaction.rollback();
      return res.status(500).json({ message: e.message, error: true });
    }
  },
  excel: async (req, res) => {
    const path = `./public/excels/`;
    try {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Barang");
      worksheet.mergeCells("A1:J1");
      worksheet.getCell("A1").value = "Data Barang";
      worksheet.getCell("A1").alignment = { horizontal: "center" };
      worksheet.getCell("A1").font = { size: 14, bold: true };

      worksheet.addRow([""]);

      worksheet.addRow(["Barcode", "Nama Barang", "Satuan", "Kategori", "Min Stock", "Disc", "Harga Jual", "Harga Modal", "Keterangan", "Aktif"]);
      const data = await cari_barang_view.findAll();
      data.forEach((item) => {
        worksheet.addRow([
          item.barcode,
          item.nama,
          item.nama_satuan,
          item.nama_kategori,
          item.min_stock,
          item.disc,
          item.harga_jual,
          item.harga_modal,
          item.keterangan,
          item.aktif ? "Aktif" : "Tidak Aktif",
        ]);
      });

      for (let i = 3; i <= data.length + 3; i++) {
        for (let j = 1; j <= 10; j++) {
          const cell = worksheet.getCell(i, j);
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          // set width column
          if (j == 1) {
            worksheet.getColumn(j).width = 15;
          } else if (j == 2) {
            worksheet.getColumn(j).width = 30;
          } else if (j == 3) {
            worksheet.getColumn(j).width = 15;
          } else if (j == 4) {
            worksheet.getColumn(j).width = 15;
          } else if (j == 5) {
            worksheet.getColumn(j).width = 15;
          } else if (j == 6) {
            worksheet.getColumn(j).width = 15;
          } else if (j == 7) {
            worksheet.getColumn(j).width = 15;
          } else if (j == 8) {
            worksheet.getColumn(j).width = 15;
          } else if (j == 9) {
            worksheet.getColumn(j).width = 30;
          } else if (j == 10) {
            worksheet.getColumn(j).width = 15;
          }
        }
      }

      // cek jika folder belum ada
      if (!fs.existsSync(path)) fs.mkdirSync(path);
      const name_file = `laporan_list_barang_${moment().format("YYYYMMDDHHmm")}`;
      const url = `${path.split("/")[2]}/${name_file}.xlsx`
      await workbook.xlsx.writeFile(`${path}${name_file}.xlsx`).then(() => {
        res.status(200).json({ error: false, message: "File berhasil diunduh", file: url });
      });
    } catch (error) {
      return res.status(500).json({ message: error.message, error: true });
    }
  },
  import: async (req, res) => {
    const transaction = await sq.transaction();
    return res.status(500).json({ message: "Fitur ini belum tersedia", error: true, file: req.files});
    try {
      const { file } = req.files;
      const path = `./public/uploads/${file.name}`;
      file.mv(path, async (err) => {
        if (err) return res.status(500).json({ message: err.message, error: true });
        try {
          const workbook = new excelJS.Workbook();
          await workbook.xlsx.readFile(path);
          const worksheet = workbook.getWorksheet(1);
          const data = [];
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 2) {
              const barcode = row.getCell(1).value;
              const nama = row.getCell(2).value;
              const kode_satuan = row.getCell(3).value;
              const kode_kategori = row.getCell(4).value;
              const min_stock = row.getCell(5).value;
              const disc = row.getCell(6).value;
              const harga_jual = row.getCell(7).value;
              const harga_modal = row.getCell(8).value;
              const keterangan = row.getCell(9).value;
              const aktif = row.getCell(10).value;
              data.push({
                barcode,
                nama,
                kode_satuan,
                kode_kategori,
                min_stock,
                disc,
                harga_jual,
                harga_modal,
                keterangan,
                aktif,
              });
            }
          });
          data.forEach(async (item) => {
            await barang.create(
              {
                barcode: item.barcode,
                nama: item.nama,
                satuan: item.kode_satuan,
                kategori: item.kode_kategori,
                min_stock: clear_alphabet(clear_char(item.min_stock)),
                disc: clear_alphabet(clear_char(item.disc)),
                harga_jual: clear_alphabet(clear_char(item.harga_jual)),
                harga_modal: clear_alphabet(clear_char(item.harga_modal)),
                keterangan: item.keterangan,
                aktif: item.aktif,
                pemakai: req.user.myusername.toUpperCase(),
                tglsimpan: moment().format("YYYY-MM-DD HH:mm:ss"),
              },
              { transaction }
            );
          });
          await transaction.commit();
          return res.status(200).json({ error: false, message: "Data berhasil diimport" });
        } catch (error) {
          await transaction.rollback();
          return res.status(500).json({ message: error.message, error: true });
        }
      }
      );
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({ message: error.message, error: true });
    }
  }
};

export default barang_cont;
