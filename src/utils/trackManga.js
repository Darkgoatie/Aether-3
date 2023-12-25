const { Mangadex } = require("mangadex-wrapper");
const clientTrackedMangaModel = require("../managers/clientTrackedMangas");
const trackedMangaModel = require("../managers/userTrackedLists");
const { Client, MessageEmbed } = require("discord.js");

const delay = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

function extractChapters(aggregation) {
  const volumeKeys = Object.keys(aggregation);
  let all = [];
  volumeKeys.forEach((vol) => {
    const chapters = Object.values(aggregation[vol].chapters);

    chapters.map((ch) => {
      ch.volume = vol;
      return ch;
    });
    all.push(...chapters);
  });
  return all;
}
/**
 *
 * @param {Client} client
 */
const trackManga = async (client) => {
  const md = new Mangadex();
  mgs = await trackedMangaModel.aggregate([
    // Unwind the trackedManga array to have each manga as a separate document
    { $unwind: "$trackedManga" },
    // Group by trackedManga and add them to an array while removing duplicates
    {
      $group: {
        _id: "$trackedManga",
        users: { $addToSet: "$userID" },
      },
    },
    // Project to reshape the output if needed
    {
      $project: {
        _id: 0, // Exclude _id field if not needed
        mangaID: "$_id",
        users: 1,
      },
    },
  ]);
  let trackids = mgs.map((m) => m.mangaID);
  let Mangas = [];
  let chunkSize = 100;

  for (let i = 0; i < trackids.length; i += chunkSize) {
    const chunk = trackids.slice(i, i + chunkSize);
    Mangas.push(
      ...(await md.fetchManga({
        ids: chunk,
      }))
    );
  }
  for (let index = 0; Mangas.length !== 0; index++) {
    const m = Mangas.shift();
    const aggregationData = extractChapters(await md.aggregateMangaByID(m.id));
    let lastSavedChapter = (
      await clientTrackedMangaModel.findOne({
        mangaID: m.id,
      })
    ).latestChapter;
    const toMathMax = aggregationData
      .map((chap) => {
        return parseInt(chap.chapter, 10);
      })
      .filter((ch) => isNaN(ch) === false);

    let latestChapter = Math.max(...toMathMax);

    if (latestChapter.toString() !== lastSavedChapter.toString()) {
      await clientTrackedMangaModel.findOneAndUpdate(
        { mangaID: m.id },
        { $set: { latestChapter: `${latestChapter}` } }
      );
      const users = mgs.find((o) => o.mangaID === m.id).users;

      for (const userId of users) {
        try {
          const user = await client.users.fetch(userId);
          if (user) {
            await user.send({
              embeds: [
                new MessageEmbed()
                  .setTitle(`New Chapter of ${m.title.en} released!`)
                  .setDescription(
                    `Chapter ${latestChapter} has been released! \n [Mangadex URL](${encodeURI(
                      m.getHumanURL()
                    )})`
                  )
                  .addFields([
                    {
                      name: "MangaID",
                      value: "```" + m.id + "```",
                    },
                  ]),
              ],
            });
            await delay(100); // Delay of 100ms between each message
          }
        } catch (error) {
          console.error(
            `Failed to send message to user with ID ${userId}:`,
            error
          );
        }
      }
    }
  }
};

module.exports = trackManga;
