const mongoose = require("mongoose");
const { onError } = require("./Events/db/on/error");
const { onceOpen } = require("./Events/db/once/open");
require("dotenv").config();
mongoose.connect(process.env.URI);
const db = mongoose.connection;
db.on("error", onError);
db.once("open", onceOpen);

module.exports = {
  db,
  mongoose,
};
