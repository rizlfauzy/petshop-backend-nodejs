import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import sq from "./db.js";
import route from "./routes/main.js";
require("dotenv").config();
const { PREFIX_ROUTE, APP_PORT, APP_NAME, APP_URL, APP_FRONTEND_URL } = process.env;
const app = express();
const http = require("http").createServer(app);
import { Server } from "socket.io";
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

io.on("connection",(socket) => {
  console.log("a user connected");
  socket.on("graph",async (data) => {
    const res = await sq.query(`SELECT * FROM get_sales_one_year('${data.year}01', '${data.year}12')`, { type: Sequelize.QueryTypes.SELECT });
    if (res.length != 12) {
      // jika ada bulan yang kosong isi dengan 0
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
      io.emit("graph", new_data);
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
