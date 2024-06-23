import { Router } from "express";
import auth from "../../controllers/api/auth";
import sidebar from "../../controllers/api/sidebar_controller";
import password from "../../controllers/api/password_controller";
import info from "../../controllers/api/informasi_controller";
import grup_cont from "../../controllers/api/grup_controller";
import main from "../../controllers/global/main_controller";
import { is_login } from "../../middlewares/auth";
import { check_login, check_password, check_info, check_page, check_save_grup, check_update_grup } from "../../utils/validator";

export default Router()
  .post("/login", check_login, auth.login)
  .post("/page", is_login, check_page, main.index)
  .get("/sidebar", is_login, sidebar.index)
  .get("/user", is_login, password.show)
  .put("/user", is_login, check_password, password.update)
  .get("/info", is_login, info.index)
  .post("/info", is_login, check_info, info.save)
  .get("/grup", is_login, grup_cont.one)
  .post("/grup", is_login, check_save_grup, grup_cont.save)
  .put("/grup", is_login, check_update_grup, grup_cont.update)
  .post("/logout", is_login, auth.logout);
