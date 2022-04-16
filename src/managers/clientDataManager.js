const { mongoose } = require("../mongoose");

const schema = new mongoose.Schema({
  iconURL: String,
  URI: String,
  id: String,
  token: String,
});

const dataModel = mongoose.model("clientData", schema);

module.exports = dataModel;
