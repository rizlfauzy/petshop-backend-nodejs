import { Router } from "express";
import api_routes from "./api/api_routes";
import reports_routes from "./reports/reports_routes";
require("dotenv").config();

const { PREFIX_ROUTE } = process.env;

export default Router()
  .use(`${PREFIX_ROUTE}api`, api_routes)
  .use(`${PREFIX_ROUTE}reports`, reports_routes)
  .use((req, res) => {
    res.status(404).json({ message: "Not found", error: true });
  });
