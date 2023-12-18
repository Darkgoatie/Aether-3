const { mongoose } = require("../mongoose");

const cliSchema = new mongoose.Schema({
  iconURL: String,
  id: String,
  token: String,
});

const dataModel = mongoose.model("clientdatas", cliSchema);
module.exports = dataModel;
