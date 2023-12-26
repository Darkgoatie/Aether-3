const { mongoose } = require("../mongoose");

const trackedMangaSchema = new mongoose.Schema(
  {
    mangaID: String,
    latestChapter: String,
  },
  { id: false }
);

const clientTrackedMangaModel = mongoose.model(
  "clientTrackedManga",
  trackedMangaSchema
);

module.exports = clientTrackedMangaModel;
