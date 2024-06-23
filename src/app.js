import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import sq from "./db.js";
import route from "./routes/main.js";
import informasi from "./models/api/informasi_model.js";
require("dotenv").config();
const { PREFIX_ROUTE, APP_PORT, APP_NAME, APP_URL, APP_FRONTEND_URL } = process.env;
const app = express();
const http = require("http").createServer(app);
import { Server } from "socket.io";
import moment from "moment";
const Sequelize = require("sequelize");
const io = new Server(http, {
  cors: {
    origin: APP_FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.locals.moment = require("moment");

// middleware
app.use(PREFIX_ROUTE, express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 1000 * 60 * 30 },
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  cors({
    origin: APP_FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

sq.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

io.on("connection", (socket) => {
  // console.log("a user connected");

  socket.on("graph", async (data) => {
    try {
      const res = await sq.query(`SELECT * FROM get_sales_one_year('${data.year}01', '${data.year}12')`, { type: Sequelize.QueryTypes.SELECT });
      if (res.length != 12) {
        const new_data = [];
        for (let i = 1; i <= 12; i++) {
          const bulan = i.toString().padStart(2, "0");
          const periode = `${data.year}-${bulan}`;
          let found = false;
          res.forEach((item) => {
            if (item.periode == periode) {
              found = true;
              new_data.push(item);
              return;
            }
          });
          if (!found) new_data.push({ periode, penjualan: 0 });
        }
        io.emit("graph", {
          error: false,
          message: "Data berhasil diambil",
          data: new_data,
        });
      }
    } catch (e) {
      io.emit("graph", { error: true, message: e.message });
    }
  });

  socket.on("omset", async (data) => {
    try {
      const { start, end } = data;
      const tgl_awal = moment(start).format("YYYYMMDD");
      const tgl_akhir = moment(end).format("YYYYMMDD");
      const res = await sq.query(`SELECT * FROM get_sales_by_date('${tgl_awal}', '${tgl_akhir}')`, { type: Sequelize.QueryTypes.SELECT });
      io.emit("omset", {
        error: false,
        message: "Data berhasil diambil",
        data: res[0] || null,
      });
    } catch (e) {
      io.emit("omset", { error: true, message: e.message });
    }
  });

  socket.on("notif", async (data) => {
    try {
      const periode = moment(data.periode).format("YYYYMM");
      const res = await sq.query(`SELECT * FROM get_notif_min_stock_barang('${periode}')`, { type: Sequelize.QueryTypes.SELECT });
      io.emit("notif", {
        error: false,
        message: "Data berhasil diambil",
        data: res,
      });
    } catch (e) {
      io.emit("notif", { error: true, message: e.message });
    }
  });

  socket.on("info", async () => {
    try {
      const data = await informasi.findOne({ attributes: ["info"], order: [["id", "DESC"]] });
      io.emit("info", {
        error: false,
        message: "Data berhasil diambil",
        data,
      });
    } catch (e) {
      io.emit("info", { error: true, message: e.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(route);

http.listen(APP_PORT, () => {
  console.log(`${APP_NAME} is running on ${APP_URL}`);
});
