import grup from "./api/grup_model";
import satuan from "./api/satuan_model";
import cari_user_view from "./api/user_model";
import cari_barang_view from "./api/cari_barang_model";
import kategori from "./api/kategori_model";

const model = {
  grup,
  user: cari_user_view,
  satuan,
  kategori,
  barang: cari_barang_view,
}

export default model;