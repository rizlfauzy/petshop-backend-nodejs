import grup from "./api/grup_model";
import satuan from "./api/satuan_model";
import cari_user_view from "./api/user_model";
import cari_barang_view from "./api/cari_barang_model";
import kategori from "./api/kategori_model";
import cari_stock_barang from "./api/cari_stock_barang";
import order from "./api/order_model";
import one_pembelian from "./api/cari_one_pembelian";
import sales from "./api/sales_model";
import one_sales_order from "./api/cari_one_sales_order";
import barang_rusak from "./api/barang_rusak_model";
import one_barang_rusak from "./api/cari_one_barang_rusak";
import repack_barang from "./api/repack_barang_model";
import one_repack_barang from "./api/cari_one_repack_barang";

const model = {
  grup,
  user: cari_user_view,
  satuan,
  kategori,
  barang: cari_barang_view,
  stock_barang: cari_stock_barang,
  pembelian: order,
  one_pembelian,
  penjualan: sales,
  one_sales_order,
  barang_rusak,
  one_barang_rusak,
  repack_barang,
  one_repack_barang,
}

export default model;