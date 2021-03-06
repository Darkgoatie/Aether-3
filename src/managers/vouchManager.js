const { mongoose } = require("../mongoose");

const vouchSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  vouches: Number,
  lastVouch: Number,
});

const vouchModel = mongoose.model("vouches", vouchSchema);

module.exports = vouchModel;
