import { Router } from "express";
import report_cont from "../../controllers/api/report_controller";
import { is_login } from "../../middlewares/auth";

export default Router()
  .get("/orders", is_login, report_cont.orders)
  .get("/sales", is_login, report_cont.sales)
  .get("/stocks", is_login, report_cont.stocks)
  .get("/stock", is_login, report_cont.stock);
