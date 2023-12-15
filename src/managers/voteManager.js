const {mongoose} = require("../mongoose");

const voteSchema = new mongoose.Schema({
    userId: String, voteCount: Number, lastVote: Number,
});

const voteModel = mongoose.model("votes", voteSchema);

module.exports = voteModel;
