const config = require("./config.json");
const mongoose = require("mongoose");
mongoose.connect(config.mongo.URI);
const db = mongoose.connection;
db.on("error", err => console.error(`Connection error: ${err}`));
db.once('open', () => {
    console.log('Connected to MongoDB.');
});

module.exports = { db, mongoose };