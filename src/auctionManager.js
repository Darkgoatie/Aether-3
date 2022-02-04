const { mongoose } = require("./mongoose");

const aucSchema = new mongoose.Schema({
  channelId: String,
  guildId: String,
  messageId: String,
  price: Number,
  startedAt: Number,
  winner: String,
  item: String,
  hostedBy: String,
  totalBids: Number,
  autoEndSettings: {
    autoEnd: Boolean,
    endAt: Number,
  },
});

const aucModel = mongoose.model("auctions", aucSchema);

module.exports = aucModel;
