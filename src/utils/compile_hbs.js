const fs = require("fs");
const path = require("path");
const hbs = require("handlebars");

export default function compile_hbs(template, data) {
  const file_path = path.join(__dirname, "../templates", `${template}.hbs`);
  const html = fs.readFileSync(file_path, "utf8");
  return hbs.compile(html)(data)
}