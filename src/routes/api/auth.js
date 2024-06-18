import { Router } from "express";
import auth from "../../controllers/api/auth";
import sidebar from "../../controllers/api/sidebar";
import { is_login } from "../../middlewares/auth";
import { login } from "../../utils/validator";

export default Router()
  .post("/login", login, auth.login)
  .get("/sidebar", is_login, sidebar.index)
  .post("/logout", is_login, auth.logout);