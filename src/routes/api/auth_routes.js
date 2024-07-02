import { Router } from "express";
import auth_cont from "../../controllers/api/auth_controller";
import sidebar from "../../controllers/api/sidebar_controller";
import password from "../../controllers/api/password_controller";
import info from "../../controllers/api/informasi_controller";
import grup_cont from "../../controllers/api/grup_controller";
import main from "../../controllers/global/main_controller";
import satuan_cont from "../../controllers/api/satuan_controller";
import kategori_cont from "../../controllers/api/kategori_controller";
import barang_cont from "../../controllers/api/barang_controller";
import otority_cont from "../../controllers/api/otority_controller";
import order_cont from "../../controllers/api/order_controller";
import sales_cont from "../../controllers/api/sales_controller";
import multer from "multer";
import { is_login } from "../../middlewares/auth";
import { check_login, check_password, check_info, check_page, check_save_grup, check_update_grup, check_register_user, check_update_user, check_save_satuan, check_update_satuan, check_save_kategori, check_update_kategori, check_save_barang, check_update_barang, check_save_otority, check_save_order, check_update_order, check_cancel_order, check_save_sales } from "../../utils/validator";

const upload = multer({ dest: "./public" });

export default Router()
  .post("/login", check_login, auth_cont.login)
  .post("/page", is_login, check_page, main.index)
  .get("/sidebar", is_login, sidebar.index)
  .get("/password", is_login, password.show)
  .put("/password", is_login, check_password, password.update)
  .get("/info", is_login, info.index)
  .post("/info", is_login, check_info, info.save)
  .get("/grup", is_login, grup_cont.one)
  .post("/grup", is_login, check_save_grup, grup_cont.save)
  .put("/grup", is_login, check_update_grup, grup_cont.update)
  .get("/user", is_login, auth_cont.one)
  .post("/user", is_login, check_register_user, auth_cont.register)
  .put("/user", is_login, check_update_user, auth_cont.update)
  .get("/satuan", is_login, satuan_cont.one)
  .post("/satuan", is_login, check_save_satuan, satuan_cont.save)
  .put("/satuan", is_login, check_update_satuan, satuan_cont.update)
  .get("/kategori", is_login, kategori_cont.one)
  .post("/kategori", is_login, check_save_kategori, kategori_cont.save)
  .put("/kategori", is_login, check_update_kategori, kategori_cont.update)
  .get("/barang", is_login, barang_cont.one)
  .get("/goods", is_login, barang_cont.all)
  .post("/barang", is_login, check_save_barang, barang_cont.save)
  .put("/barang", is_login, check_update_barang, barang_cont.update)
  .get("/goods/excel", is_login, barang_cont.excel)
  .post("/goods/import", is_login, upload.single("file_xlsx"), barang_cont.import)
  .get("/stock", is_login, barang_cont.one_stock)
  .get("/otority/menus", is_login, otority_cont.all_menu)
  .get("/otority/find-menu", is_login, otority_cont.likes_menu)
  .get("/otority/menu", is_login, otority_cont.menu_role)
  .post("/otority", is_login, check_save_otority, otority_cont.save)
  .get("/order", is_login, order_cont.one)
  .post("/order", is_login, check_save_order, order_cont.save)
  .put("/order", is_login, check_update_order, order_cont.update)
  .delete("/order", is_login, check_cancel_order, order_cont.cancel)
  .get("/sales", is_login, sales_cont.one)
  .post("/sales", is_login, check_save_sales, sales_cont.save)
  .post("/logout", is_login, auth_cont.logout);
