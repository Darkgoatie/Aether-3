const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { Permissions, MessageEmbed } = require("discord.js");
const ms = require("ms");

const name = "giveaway";
const description = "Base Giveaway Command";
const builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("start")
      .setDescription("Starts a giveaway")
      // .addIntegerOption(opt => opt.setName("days").setDescription("Giveaway Length").setRequired(true).setMinValue(0).setMaxValue(6))
      // .addIntegerOption(opt => opt.setName("hours").setDescription("Giveaway Length").setRequired(true).setMinValue(0).setMaxValue(23))
      // .addIntegerOption(opt => opt.setName("minutes").setDescription("Giveaway Length").setRequired(true).setMinValue(0).setMaxValue(59))
      .addStringOption(opt =>
        opt
          .setName("time")
          .setDescription("The time the giveaway will end in.")
          .setRequired(true)
      )
      .addStringOption(opt =>
        opt
          .setName("prize")
          .setDescription("The Prize of the giveaway")
          .setRequired(true)
      )
      .addIntegerOption(opt =>
        opt
          .setName("winners")
          .setDescription("The amount of winners in this giveaway")
          .setMaxValue(10)
          .setMinValue(1)
      )
      .addChannelOption(opt =>
        opt
          .setName("channel")
          .setDescription("The channel to put the giveaway in")
          .addChannelType(ChannelType.GuildText)
      )
      .addRoleOption(opt =>
        opt
          .setName("mention")
          .setDescription("The role to ping after starting the giveaway")
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("end")
      .setDescription("Ends an active giveaway")
      .addStringOption(opt =>
        opt
          .setName("id")
          .setDescription("The ID of the giveaway that will be ended")
          .setRequired(true)
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("reroll")
      .setDescription("Rerolls an ended giveaway")
      .addStringOption(opt =>
        opt
          .setName("id")
          .setDescription("The ID of the giveaway that will be rerolled")
          .setRequired(true)
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("list")
      .setDescription("Lists filtered giveaways")
      .addChannelOption(opt =>
        opt
          .setName("channel")
          .setDescription("Filter to see the giveaways of a channel.")
          .addChannelType(ChannelType.GuildText)
      )
      .addStringOption(opt =>
        opt
          .setName("prize")
          .setDescription("Filter to see the giveaways of a prize.")
      )
      .addBooleanOption(opt =>
        opt
          .setName("ended")
          .setDescription("Filter to see the giveaways that are ended or not.")
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("setemoji")
      .setDescription("Sets the default giveaway emoji for this server.")
      .addStringOption(opt =>
        opt
          .setName("emoji")
          .setDescription("The name of the emoji that'll be set as default")
          .setRequired(true)
      )
  );

const onInteraction = async ({ int, client }) => {
  const gConfModel = require("../managers/guildManager.js");
  const thisGuildConf = (
    await gConfModel.find({ guildId: int.guild.id }).exec()
  )[0];

  const subcommand = int.options.getSubcommand();

  switch (subcommand) {
    case "start":
      let Cemoji = "866637037607845929";
      let tgEmoji = {
        id: "866637037607845929",
        name: "AetherGift",
      };

      if (
        typeof thisGuildConf.giveawaySettings.emoji !== undefined ||
        thisGuildConf.giveawaySettings.emoji === null ||
        typeof int.guild.emojis.find(
          e => e.id === thisGuildConf.giveawaySettings.emoji
        ) !== "undefined"
      ) {
        Cemoji = int.guild.emojis.cache.find(
          e => e.id === thisGuildConf.giveawaySettings.emoji
        );
        tgEmoji = int.guild.emojis.cache.find(
          e => e.id === thisGuildConf.giveawaySettings.emoji
        );
      }
      if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
        return int.reply({
          ephemeral: true,
          content: "You need manage messages permissions to use this command!",
        });
      gwLength = parseInt(ms(int.options.getString("time")));
      winners = int.options.getInteger("winners")
        ? parseInt(int.options.getInteger("winners"))
        : 1;
      prize = int.options.getString("prize");
      roleToMention = int.options.getRole("mention");
      giveawayChannel = int.options.getChannel("channel");

      if (isNaN(gwLength))
        return int.reply({
          content:
            "Inputted time is not a valid amount of time! Try using these: \n 1d, 1d12h, 30m, 6h",
          ephemeral: true,
        });
      if (gwLength > parseInt(ms("7d")))
        return int.reply({
          content:
            "This time is too long! Maximum length of a giveaway shall be a week (7 days)!",
          ephemeral: true,
        });
      await client.giveawaysManager.start(
        giveawayChannel ? giveawayChannel : int.channel,
        {
          duration: gwLength,
          winnerCount: winners,
          prize,
          messages: {
            giveawayEnded: `<:${tgEmoji.name}:${tgEmoji.id}><:${tgEmoji.name}:${tgEmoji.id}>Giveaway ended!<:${tgEmoji.name}:${tgEmoji.id}><:${tgEmoji.name}:${tgEmoji.id}>`,
            giveaway: `<:${tgEmoji.name}:${tgEmoji.id}><:${tgEmoji.name}:${tgEmoji.id}>Giveaway!<:${tgEmoji.name}:${tgEmoji.id}><:${tgEmoji.name}:${tgEmoji.id}>`,
            inviteToParticipate: `React with <:${tgEmoji.name}:${tgEmoji.id}> to join!`,
          },
          reaction: Cemoji,
          extraData: {
            hostedBy: int.user.id,
          },
        }
      );
      int.reply({
        content: `A giveaway has been successfully started in <#${
          giveawayChannel ? giveawayChannel.id : int.channel.id
        }> !`,
        ephemeral: true,
      });
      if (roleToMention !== null) {
        await int.channel.send({
          content: `Ping: <@&${roleToMention.id}>`,
        });
      }
      break;
    case "end":
      messageId = int.options.getString("id");
      messageId = messageId.includes("-") ? messageId.split("-")[1] : messageId;
      if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
        return int.reply({
          ephemeral: true,
          content: "You need manage messages permissions to use this command!",
        });
      client.giveawaysManager
        .end(messageId)
        .then(() => {
          int.reply({
            ephemeral: true,
            content: `Giveaway with id "${messageId}" was ended!`,
          });
        })
        .catch(err => {
          int.reply({
            ephemeral: true,
            content: `This giveaway was not found!`,
          });
        });
      break;
    case "reroll":
      messageId = int.options.getString("id");
      messageId = messageId.includes("-") ? messageId.split("-")[1] : messageId;
      if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
        return int.reply({
          ephemeral: true,
          content: "You need manage messages permissions to use this command!",
        });
      client.giveawaysManager
        .reroll(messageId)
        .then(() => {
          int.reply({
            ephemeral: true,
            content: `Giveaway with id "${messageId}" was rerolled!`,
          });
        })
        .catch(err => {
          int.reply({
            ephemeral: true,
            content: `This giveaway was not found!`,
          });
        });
      break;
    case "list":
      gws = client.giveawaysManager.giveaways;
      ftrChannel = int.options.getChannel("channel");
      ftrPrize = int.options.getString("prize");
      ftrEnded = int.options.getBoolean("ended");
      gws = gws.filter(gw => gw.guildId === int.guild.id);
      if (ftrChannel !== null)
        gws = gws.filter(gw => gw.channelId == ftrChannel.id);
      if (ftrPrize !== null) gws = gws.filter(gw => gw.prize == ftrPrize);
      if (ftrEnded !== null) gws = gws.filter(gw => gw.ended === ftrEnded);
      if (gws.length < 1)
        return int.reply("Couldn't find any giveaways matching these tags!");
      let n = 0;
      gws = gws.map(gw => {
        n++;
        return {
          val: `Channel: <#${gw.channelId}>, Prize: ${gw.prize} `,
          nm: `Giveaway #${n}`,
        };
      });

      // This part was the hardest code i ever wrote :(
      embeds = [];
      for (
        let embedCount = 0;
        embedCount < 10 && gws.length > 0;
        embedCount++
      ) {
        emb = new MessageEmbed()
          .setTitle("Giveaways list")
          .setFooter({ text: `Page ${embedCount}` });

        for (
          let fieldCount = 0;
          fieldCount < 25 && gws.length > 0;
          fieldCount
        ) {
          data = gws.shift();
          emb.addField(data.nm, data.val, true);
        }
        embeds.push(emb);
      }
      int.reply({
        embeds,
      });
      break;
    case "setemoji":
      if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
        return int.reply({
          ephemeral: true,
          content: "You need manage guild permissions to use this command!",
        });

      emojiName = int.options.getString("emoji");
      emoji = int.guild.emojis.cache.find(emj => emj.name === emojiName);

      if (typeof emoji === "undefined" || emoji === null)
        return int.reply({
          ephemeral: true,
          content: `Emoji was not found! Query: { name: ${emojiName} }`,
        });

      await gConfModel.updateOne(
        { guildId: int.guild.id },
        { giveawaySettings: { emoji: emoji.id } }
      );
      return int.reply({
        content: `Giveaway default emoji was updated. New Emoji: <:${emoji.name}:${emoji.id}>`,
      });
      break;

    default:
      // Handle unknown subcommand
      int.reply({
        ephemeral: true,
        content: "Unknown subcommand!",
      });
  }
};

module.exports = {
  name,
  description,
  builder,
  onInteraction,
};
