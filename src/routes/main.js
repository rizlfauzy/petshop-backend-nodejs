import { Router } from "express";
import auth_routes from "./api/auth_routes";
require("dotenv").config();

const { PREFIX_ROUTE } = process.env;

export default Router()
  .use(`${PREFIX_ROUTE}api`, auth_routes)
  .use((req, res) => {
    res.status(404).json({ message: "Not found", error: true });
  });
