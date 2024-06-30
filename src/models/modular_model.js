import grup from "./api/grup_model";
import satuan from "./api/satuan_model";
import cari_user_view from "./api/user_model";
import cari_barang_view from "./api/cari_barang_model";
import kategori from "./api/kategori_model";
import cari_stock_barang from "./api/cari_stock_barang";
import order from "./api/order_model";

const model = {
  grup,
  user: cari_user_view,
  satuan,
  kategori,
  barang: cari_barang_view,
  stock_barang: cari_stock_barang,
  pembelian: order,
}

export default model;