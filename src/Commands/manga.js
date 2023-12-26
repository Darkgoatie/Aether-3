const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} = require("@discordjs/builders");
const trackedMangaModel = require("../managers/userTrackedLists");
const {
  MessageEmbed,
  CommandInteraction,
  MessageComponentInteraction,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");
const { Mangadex } = require("mangadex-wrapper");
const clientTrackedMangaModel = require("../managers/clientTrackedMangas");
/**
 *
 * @param {Object} aggregation MangaAggregation
 */

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

function disableSelectMenu(messageOrInteraction) {
  const components =
    messageOrInteraction instanceof MessageComponentInteraction
      ? messageOrInteraction.message.components
      : messageOrInteraction.components;
  const selectMenu = components[0].components.find(
    (component) => component.type === "SELECT_MENU"
  );

  if (selectMenu) {
    selectMenu.setDisabled(true);
    messageOrInteraction.edit({ components: [components[0]] });
  }
}

function updateSelectMenu(interaction, selectedData) {
  const components = interaction.message.components;
  const selectMenu = components[0].components.find(
    (component) => component.type === "SELECT_MENU"
  );

  if (selectMenu) {
    selectMenu.setPlaceholder(`${selectedData}`);
    interaction.message.edit({ components: [components[0]] });
  }
}

const name = "manga";
const description = "Base Manga Command";
const builder = new SlashCommandBuilder()
  .setName("manga")
  .setDescription(description)
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("search")
      .setDescription("Searches for a manga")
      .addStringOption((opt) =>
        opt
          .setName("title")
          .setDescription("The Manga name you'd like to search for.")
          .setRequired(true)
      )
  ) /*
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("author")
      .setDescription("Find the mangas of an author")
      .addStringOption((opt) =>
        opt
          .setName("author")
          .setDescription("The Author name you'd like to search for.")
          .setRequired(true)
      )
  )*/
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("latestchapter")
      .setDescription("Find the latest chapter of a manga")
      .addStringOption((opt) =>
        opt.setName("manga").setDescription("The Manga ID").setRequired(true)
      )
  ) /*
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("info")
      .setDescription("Shows the info of a manga")
      .addStringOption((opt) =>
        opt
          .setName("manga")
          .setDescription("Manga ID to display info for.")
          .setRequired(true)
      )
  )*/
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("untrack")
      .setDescription("Removes a manga from your tracking list")
      .addStringOption((opt) =>
        opt.setName("manga").setDescription("Manga ID").setRequired(true)
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("track")
      .setDescription("Adds a manga to your tracking list")
      .addStringOption((opt) =>
        opt.setName("manga").setDescription("Manga ID").setRequired(true)
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("trackinglist")
      .setDescription("Shows your manga tracking list")
      .addBooleanOption((opt) =>
        opt
          .setName("displaydetails")
          .setDescription(
            "Should the details (MangaID, AuthorID) of be displayed? Default set to false."
          )
      )
  );

/**
 *
 * @param {{int: CommandInteraction}} param0
 */
const onInteraction = async ({ int }) => {
  const md = new Mangadex();
  const subcommand = int.options.getSubcommand();
  if ((await trackedMangaModel.exists({ userID: int.user.id }).exec()) === null)
    await trackedMangaModel.create({
      userID: int.user.id,
      trackedManga: [],
    });

  switch (subcommand) {
    case "trackinglist":
      userdata = await trackedMangaModel
        .findOne({ userID: int.user.id })
        .exec();

      if (userdata.trackedManga.length === 0) {
        return int.reply({
          ephemeral: true,
          content:
            "You don't have any tracked manga! \n __**3 Simple steps to track a manga:**__ \n 1.  Find a manga by name using `/manga search`. \n 2. Copy the Manga ID. \n 3. Use `/manga track` and input the id of the manga.",
        });
      }

      const displayDetailsOption =
        int.options.getBoolean("displaydetails") !== true ? false : true;
      switch (displayDetailsOption) {
        case true:
          fields = (
            await md.fetchManga({
              ids: userdata.trackedManga,
            })
          ).map((m) => {
            return {
              name: m.title.en,
              value: `ID: \n \`\`\`${
                m.id
              }\`\`\` \n Author ID: \n \`\`\`${m.getAuthor()}\`\`\` \n [Mangadex URL](${encodeURI(
                m.getHumanURL()
              )})`,
              inline: true,
            };
          });

          return int.reply({
            embeds: [
              new MessageEmbed()
                .setTitle("Tracking list of " + int.user.username)
                .setFooter({
                  text: "Manga tracker by Aether | Credits to Mangadex API!",
                })
                .setTimestamp()
                .addFields(fields)
                .setColor("#aa1f24"),
            ],
          });
        case false:
          return int.reply({
            embeds: [
              new MessageEmbed()
                .setTitle("Tracking list of " + int.user.username)
                .setFooter({
                  text: "Manga tracker by Aether | Credits to Mangadex API!",
                })
                .setTimestamp()
                .setDescription(
                  (
                    await md.fetchManga({
                      ids: userdata.trackedManga,
                    })
                  )
                    .map((m) => {
                      return "- " + m.title.en;
                    })
                    .join("\n")
                )
                .setColor("#aa1f24"),
            ],
          });
      }
    case "search":
      const title = int.options.getString("title");
      let mangas = await md.fetchManga({
        title: title,
        order: {
          relevance: "desc",
          followedCount: "desc",
        },
      });

      if (mangas.length === 0) {
        return int.reply({
          ephemeral: true,
          content: "Couldn't find manga with given title: \"" + title + '"',
        });
      }

      mangas = mangas.slice(0, 20);

      const coverArt = await md.fetchCoverArtByID(mangas[0].getCoverArt());
      function truncateText(text, len) {
        if (text.length > len) {
          return text.substring(0, len - 3) + "...";
        } else {
          return text;
        }
      }
      let options = mangas.map((m) => {
        return {
          label: m.title.en,
          description: `${truncateText(
            m.description.en ? m.description.en : "No description",
            80
          )}`,
          value: `res_${m.id}`,
        };
      });
      options = options.map((opt) => {
        opt.label = truncateText(opt.label, 80);
        return opt;
      });
      try {
        await int.reply({
          ephemeral: true,
          content:
            "Displaying info for searched manga, use select menu for alternative results!",
        });
      } catch (e) {}

      const sentMessage = await int.channel.send({
        content: `ID: \`${mangas[0].id}\``,
        embeds: [
          new MessageEmbed()
            .setTitle(mangas[0].title.en)
            .setColor("#aa1f20")
            .setImage(coverArt.getImageUrl())
            .setThumbnail(coverArt.getImageUrl())
            .setTimestamp()
            .setDescription(
              truncateText(
                mangas[0].description.en
                  ? mangas[0].description.en
                  : "No description",
                300
              )
            )
            .addFields([
              {
                name: "Cover Art",
                value: `[Cover Art URL](${coverArt.getImageUrl()})`,
                inline: true,
              },
              { name: "ID", value: "```" + mangas[0].id + "```", inline: true },
              {
                name: "Author",
                value: `ID: \`\`\`${mangas[0].getAuthor()}\`\`\``,
                inline: true,
              },
              {
                name: "Mangadex URL",
                value: `[URL](${encodeURI(mangas[0].getHumanURL())})`,
                inline: true,
              },
              {
                name: "Status",
                value: `${mangas[0].status}`,
                inline: true,
              },
              {
                name: "Publication Demographic",
                value: `${mangas[0].publicationDemographic}`,
                inline: true,
              },
            ])
            .setFooter({
              text: "Manga tracker by Aether | Credits to Mangadex API!",
            })
            .setAuthor({
              iconURL: int.user.avatarURL(),
              name: `Search Query: "${title}"`,
            }),
        ],
        components: [
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("selectmanga")
              .addOptions(options)
              .setPlaceholder(options[0].label)
          ),
        ],
      });
      const filter = (interaction) => interaction.customId === "selectmanga";
      const collector = sentMessage.createMessageComponentCollector({
        filter,
        time: 60000,
      }); // Change time as needed

      collector.on("collect", async (interaction) => {
        const selectedOption = interaction.values[0];
        const selectedID = selectedOption.split("_")[1];
        const selectedManga = mangas.find((m) => {
          return m.id === selectedID;
        });
        const selectedCover = await md.fetchCoverArtByID(
          selectedManga.getCoverArt()
        );
        /*
        await interaction.reply({
          ephemeral: true,
          content: `Now displaying ${selectedManga.title.en}!`,
        });
        */
        await updateSelectMenu(interaction, selectedManga.title.en);
        await interaction.update({
          content: "ID: " + selectedManga.id,
          embeds: [
            new MessageEmbed()
              .setTitle(selectedManga.title.en)
              .setColor("#aa1f20")
              .setImage(coverArt.getImageUrl())
              .setThumbnail(coverArt.getImageUrl())
              .setTimestamp()
              .setDescription(
                truncateText(
                  selectedManga.description.en
                    ? selectedManga.description.en
                    : "No description",
                  300
                )
              )
              .addFields([
                {
                  name: "Cover Art",
                  value: `[Cover Art URL](${encodeURI(
                    selectedCover.getImageUrl()
                  )})`,
                  inline: true,
                },
                {
                  name: "ID",
                  value: "```" + selectedManga.id + "```",
                  inline: true,
                },
                {
                  name: "Author",
                  value: `ID: \`\`\`${selectedManga.getAuthor()}\`\`\``,
                  inline: true,
                },
                {
                  name: "Mangadex URL",
                  value: `[URL](${encodeURI(selectedManga.getHumanURL())})`,
                  inline: true,
                },
                {
                  name: "Status",
                  value: `${selectedManga.status}`,
                  inline: true,
                },
                {
                  name: "Publication Demographic",
                  value: `${selectedManga.publicationDemographic}`,
                  inline: true,
                },
              ])
              .setFooter({
                text: "Manga tracker by Aether | Credits to Mangadex API!",
              })
              .setAuthor({
                iconURL: int.user.avatarURL(),
                name: `Search Query: "${title}"`,
              }),
          ],
        });
      });

      collector.on("end", () => {
        disableSelectMenu(sentMessage);
      });
      return;
    case "track":
      mangaID = int.options.getString("manga");
      if (mangaID.length < 36)
        return int.reply({
          content:
            "That ID seems too short. Are you sure it's correct? Try searching via `/manga search` and copying its id.",
        });

      userdata = await trackedMangaModel.findOne({ userID: int.user.id });
      if (userdata["trackedManga"].length >= 25)
        return int.reply({
          ephemeral: true,
          content:
            "Hold on there buddy, you may not track more than 25 Mangas! Remove some from your current tracking list via `/manga untrack <MangaID>` before you add something new.",
        });
      if (userdata["trackedManga"].includes(mangaID))
        return int.reply({
          content:
            "You are already tracking `" +
            mangaID +
            "`. See your current tracked mangas via `/manga trackinglist`",
          ephemeral: true,
        });
      const mangaToAdd = await md.fetchMangaByID(mangaID);
      if (mangaToAdd === null)
        return int.reply({
          ephemeral: true,
          content: "Manga with ID `" + mangaID + "` not found!",
        });

      if (
        mangaToAdd.status === "cancelled" ||
        mangaToAdd.status === "completed"
      )
        return int.reply({
          content: `**OOPS!** \n Adding "${mangaToAdd.title.en}" to your tracked mangas wouldn't be smart because it is ${mangaToAdd.status}!`,
          ephemeral: true,
        });

      if (!(await clientTrackedMangaModel.exists({ mangaID }))) {
        const aggregationData = extractChapters(
          await md.aggregateMangaByID(mangaID)
        );
        const toMathMax = aggregationData
          .map((chap) => {
            return parseInt(chap.chapter, 10);
          })
          .filter((ch) => isNaN(ch) === false);

        let latestChapter = Math.max(...toMathMax);

        await clientTrackedMangaModel.create({
          mangaID,
          latestChapter: latestChapter.toString(),
        });
      }

      userdata.trackedManga.push(mangaToAdd.id);
      await userdata.save();
      return int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(mangaToAdd.title.en)
            .setColor("#aa1f20")
            .setTimestamp()
            .setDescription(
              truncateText(
                mangaToAdd.description.en
                  ? mangaToAdd.description.en
                  : "No description",
                300
              )
            )
            .addFields([
              {
                name: "AuthorID",
                value: `\`\`\`${mangaToAdd.getAuthor()}\`\`\``,
                inline: true,
              },
              { name: "MangaID", value: `\`\`\`${mangaToAdd.id}\`\`\`` },
              {
                name: "Status",
                value: `${mangaToAdd.status}`,
                inline: true,
              },
              {
                name: "Publication Demographic",
                value: `${mangaToAdd.publicationDemographic}`,
                inline: true,
              },
            ])
            .setFooter({
              text: "Manga tracker by Aether | Credits to Mangadex API!",
            }),
        ],
        content: `Successfully added ${mangaToAdd.title.en} (ID: \`${mangaToAdd.id}\`) to your tracked mangas. You are currently tracking ${userdata.trackedManga.length} mangas.`,
      });
    case "latestchapter":
      mangaID = int.options.getString("manga");
      if (mangaID.length < 36)
        return int.reply({
          ephemeral: true,
          content:
            "That ID seems too short. Are you sure it's correct? Try searching via `/manga search` and copying its id.",
        });
      const aggregationData = extractChapters(
        await md.aggregateMangaByID(mangaID)
      );
      if (aggregationData === null)
        return int.reply({
          ephemeral: true,
          content: "Manga with ID `" + mangaID + "` not found!",
        });

      let latestVol = Math.max(
        ...aggregationData
          .filter((chap) => chap.volume !== "none")
          .map((chap) => parseInt(chap.volume, 10))
          .filter((ch) => isNaN(ch) === false)
      );
      let latestChapter = Math.max(
        ...aggregationData
          .map((chap) => parseInt(chap.chapter, 10))
          .filter((ch) => isNaN(ch) === false)
      );

      const mangaData = await md.fetchMangaByID(mangaID);
      return int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`Aggregation data of ${mangaData.title.en}`)
            .addFields([
              {
                name: "Last Chapter",
                value: `Ch: ${latestChapter}`,
                inline: true,
              },
              {
                name: "Latest Volume (Tankobon)",
                value: `Vol. ${latestVol}`,
                inline: true,
              },
            ])
            .setAuthor({
              name: "Credits to Mangadex API!",
              iconURL: int.user.avatarURL(),
            }),
        ],
      });
    case "untrack":
      mangaID = int.options.getString("manga");
      if (mangaID.length < 36)
        return int.reply({
          content:
            "That ID seems too short. Are you sure it's correct? Try searching via `/manga search` and copying its id.",
        });

      userdata = await trackedMangaModel.findOne({ userID: int.user.id });
      if (!userdata["trackedManga"].includes(mangaID))
        return int.reply({
          content:
            "Couldn't untrack manga. You aren't currently tracking `" +
            mangaID +
            "`. See your current tracked mangas via `/manga trackinglist`",
          ephemeral: true,
        });

      const mangaToRemove = await md.fetchMangaByID(mangaID);
      if (mangaToRemove === null)
        return int.reply({
          ephemeral: true,
          content: "Manga with ID `" + mangaID + "` not found!",
        });

      userdata.trackedManga = userdata.trackedManga.filter(
        (manga) => manga !== mangaToRemove.id
      );
      await userdata.save();
      return int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(mangaToRemove.title.en)
            .setColor("#aa1f20")
            .setTimestamp()
            .setDescription(
              truncateText(
                mangaToRemove.description.en
                  ? mangaToRemove.description.en
                  : "No description",
                300
              )
            )
            .addFields([
              {
                name: "AuthorID",
                value: `\`\`\`${mangaToRemove.getAuthor()}\`\`\``,
                inline: true,
              },
              { name: "MangaID", value: `\`\`\`${mangaToRemove.id}\`\`\`` },
              {
                name: "Status",
                value: `${mangaToRemove.status}`,
                inline: true,
              },
              {
                name: "Publication Demographic",
                value: `${mangaToRemove.publicationDemographic}`,
                inline: true,
              },
            ])
            .setFooter({
              text: "Manga tracker by Aether | Credits to Mangadex API!",
            }),
        ],
        content: `Successfully removed ${mangaToRemove.title.en} (ID: \`${mangaToRemove.id}\`) from your tracked mangas. You are currently tracking ${userdata.trackedManga.length} mangas.`,
      });
    case "info":
      return await int.reply({
        ephemeral: true,
        content:
          "This feature hasn't been implemented yet! Head to support server for more info.",
      });
    case "author":
      return await int.reply({
        ephemeral: true,
        content:
          "This feature hasn't been implemented yet! Head to support server for more info.",
      });
  }
};

module.exports = { onInteraction, description, name, builder };
