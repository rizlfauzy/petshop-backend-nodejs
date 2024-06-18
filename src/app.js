import express from 'express';
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import sq from "./db.js";
import route from "./routes/main.js";
require("dotenv").config();
const { PREFIX_ROUTE, APP_PORT, APP_NAME, APP_URL, APP_FRONTEND_URL } = process.env;
const app = express();
const http = require("http").createServer(app);
app.locals.moment = require("moment");

// middleware
app.use(PREFIX_ROUTE,express.static("public"));
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
app.use(cors({
  origin: APP_FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

sq.authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.use(route);

http.listen(APP_PORT, () => {
  console.log(`${APP_NAME} is running on ${APP_URL}`);
});