import { Router } from "express";
import auth from "./api/auth"
require("dotenv").config();

const { PREFIX_ROUTE } = process.env;

export default Router()
  .use(`${PREFIX_ROUTE}api`, auth)
  .use((req, res) => {
    res.status(404).json({ message: "Not found", error: true });
  });