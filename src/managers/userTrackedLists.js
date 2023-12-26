const { mongoose } = require("../mongoose");

const trackedMangaSchema = new mongoose.Schema(
  {
    userID: String,
    trackedManga: [String],
  },
  { id: false }
);

const trackedMangaModel = mongoose.model(
  "userTrackedManga",
  trackedMangaSchema
);

module.exports = trackedMangaModel;
