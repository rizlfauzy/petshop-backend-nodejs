import { Router } from "express";
import auth from "../../controllers/api/auth";
import sidebar from "../../controllers/api/sidebar";
import password from "../../controllers/api/password";
import info from "../../controllers/api/informasi_controller";
import { is_login } from "../../middlewares/auth";
import { login, check_password, check_info } from "../../utils/validator";

export default Router()
  .post("/login", login, auth.login)
  .get("/sidebar", is_login, sidebar.index)
  .get("/user", is_login, password.show)
  .put("/user", is_login, check_password, password.update)
  .get("/info", is_login, info.index)
  .post("/info", is_login, check_info, info.save)
  .post("/logout", is_login, auth.logout);