const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { Permissions, MessageEmbed } = require("discord.js");

const name = "vouch";
const description = "Base Vouch command";

const builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("config")
      .setDescription(
        "Configures the vouch manager for current guild. Must be done before using any vouch commands!"
      )
      .addChannelOption((opt) =>
        opt
          .setName("logchannel")
          .setDescription("The channel to log the vouches in.")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt
          .setName("cooldown")
          .setDescription(
            "The cooldown to be applied to make vouches (Minutes)."
          )
          .setMinValue(2)
          .setMaxValue(15)
          .setRequired(true)
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("give")
      .setDescription(
        "Vouches someone, adding +1 to their vouch score in the current guild."
      )
      .addUserOption((opt) =>
        opt
          .setName("user")
          .setDescription("The user to vouch")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("reason")
          .setDescription("The reason you're vouching this user for")
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("check")
      .setDescription("Checks someone's vouches")
      .addUserOption((opt) =>
        opt
          .setName("user")
          .setDescription(
            "The user to check the vouches of, if left blank your own vouches will be shown."
          )
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("set")
      .setDescription("Set a user's vouches to a specific amount")
      .addUserOption((opt) =>
        opt
          .setName("user")
          .setDescription("The user to set the vouches of.")
          .setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt
          .setName("amount")
          .setMinValue(0)
          .setDescription("The vouches to set to this user")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("reason")
          .setDescription("The reason you're setting the vouches of this user")
      )
  );

const onInteraction = async ({ int, client }) => {
  const vouchManager = require("../managers/vouchManager.js");
  const guildManager = require("../managers/guildManager");
  if (
    (await guildManager.find({ guildId: int.guild.id }).exec())[0] === undefined
  ) {
    await guildManager.create({ guildId: int.guild.id });
  }
  const { vouchSettings } = (
    await guildManager.find({ guildId: int.guild.id }).exec()
  )[0];
  let vouches = await vouchManager.find({ guildId: int.guild.id }).exec();
  switch (int.options.getSubcommand()) {
    case "config":
      if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
        return int.reply({
          content: "You need manage guild permissions to use this command!",
          ephemeral: true,
        });
      channel = int.options.getChannel("logchannel");
      cooldown = int.options.getInteger("cooldown") * 6e4;
      await guildManager.updateOne(
        {
          guildId: int.guild.id,
        },
        {
          vouchSettings: {
            cooldown,
            logChannel: channel.id,
          },
        }
      );
      await int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Vouch maanager configured!")
            .addField("Vouch Cooldown", `${cooldown / 6e4}mins (${cooldown}ms)`)
            .addField("Log Channel", `${channel.name} / <#${channel.id}>`)
            .setThumbnail(
              int.guild.iconURL() !== null
                ? int.guild.iconURL()
                : "https://cdn.discordapp.com/avatars/805537268349665290/71fb39825db04396548d25d604a139bb.webp"
            )
            .setAuthor({
              name: `Configured by ${int.user.tag}`,
              iconURL: int.member.displayAvatarURL(),
            }),
        ],
      });
      break;
    case "give":
      toVouch = int.options.getUser("user");
      reason = int.options.getString("reason");
      if (!vouches.find((v) => v.userId === int.user.id)) {
        await vouchManager.create({
          userId: int.user.id,
          guildId: int.guild.id,
          lastVouch: 0,
          vouches: 0,
        });
        vouches.push({
          userId: int.user.id,
          guildId: int.guild.id,
          lastVouch: 0,
          vouches: 0,
        });
      }
      cd =
        typeof vouchSettings.cooldown === "number"
          ? vouchSettings.cooldown
          : 180000;
      if (
        vouches.find((v) => v.userId === int.user.id).lastVouch + cd >
        Date.now()
      )
        return int.reply({
          ephemeral: true,
          content: `You have already vouched someone in the last ${
            cd / 6e4
          } minutes!`,
        });
      if (toVouch.id === int.user.id)
        return int.reply({
          ephemeral: true,
          content: "You can't vouch yourself!",
        });
      sent = await int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Vouch given!")
            .addField("Given by", int.user.tag + " <@" + int.user.id + ">")
            .addField("Given to", toVouch.tag + " <@" + toVouch.id + ">")
            .addField("Reason", `${reason ? reason : "No reason provided."}`)
            .setThumbnail(int.member.displayAvatarURL()),
        ],
      });

      if (vouchSettings.logChannel !== undefined) {
        logChan = await client.channels.fetch(vouchSettings.logChannel);
        if (logChan !== undefined) {
          logChan.send({
            embeds: [
              new MessageEmbed()
                .setTitle("Vouch given!")
                .addField("Given by", int.user.tag + " <@" + int.user.id + ">")
                .addField("Given to", toVouch.tag + " <@" + toVouch.id + ">")
                .addField(
                  "Reason",
                  `${reason ? reason : "No reason provided."}`
                )
                .setThumbnail(int.member.displayAvatarURL()),
            ] /*
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("LINK")
                .setLabel("Jump to message")
                .setURL(
                  `https://discord.com/channels/${int.guild.id}/${int.channel.id}/${sent.id}`
                )
            ),
          ],*/,
          });
        }
      }

      if (vouches.find((v) => v.userId === int.user.id) === undefined) {
        await vouchManager.create({
          guildId: int.guild.id,
          userId: int.user.id,
          lastVouch: 0,
          vouches: 0,
        });
      }
      await vouchManager.updateOne(
        {
          guildId: int.guild.id,
          userId: int.user.id,
        },
        {
          lastVouch: Date.now(),
        }
      );

      if (vouches.find((v) => v.userId === toVouch.id) === undefined) {
        await vouchManager.create({
          guildId: int.guild.id,
          userId: toVouch.id,
          lastVouch: 0,
          vouches: 1,
        });
      } else {
        await vouchManager.updateOne({
          guildId: int.guild.id,
          userId: toVouch.id,
          vouches: vouches.find((v) => v.userId === toVouch.id).vouches + 1,
        });
      }
      break;
    case "check":
      user =
        int.options.getUser("user") !== null
          ? int.options.getUser("user")
          : int.user;
      let userData = vouches.find((usr) => usr.userId === user.id);
      if (userData === undefined) {
        userData = {
          vouches: 0,
          guildId: int.guild.id,
          userId: user.id,
          lastVouch: 0,
        };
        await vouchManager.create(userData);
      }
      await int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`Vouches of ${user.tag}`)
            .setTimestamp()
            .setThumbnail(
              user.avatarURL() !== null ? user.avatarURL() : client.avatarURL()
            )
            .addField("Vouch Count", `${userData.vouches}`),
        ],
      });
      break;
    case "set":
      if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
        return int.reply({
          content: "You need manage guild permissions to use this command!",
          ephemeral: true,
        });
      amt = int.options.getInteger("amount");
      reason = int.options.getString("reason");
      toVouch = int.options.getUser("user");

      if (vouches.find((v) => v.userId === toVouch.id) === undefined) {
        await vouchManager.create({
          guildId: int.guild.id,
          userId: toVouch.id,
          vouches: 1,
          lastVouch: 0,
        });
      } else {
        await vouchManager.updateOne({
          guildId: int.guild.id,
          userId: toVouch.id,
          vouches: amt,
        });
      }
      await int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Vouch set!")
            .addField("Set by", int.user.tag + " <@" + int.user.id + ">")
            .addField("Set to", toVouch.tag + " <@" + toVouch.id + ">")
            .addField("Reason", `${reason ? reason : "No reason provided."}`)
            .setThumbnail(int.member.displayAvatarURL()),
        ],
      });

      if (vouchSettings.logChannel !== undefined) {
        logChan = await client.channels.fetch(vouchSettings.logChannel);
        if (logChan !== undefined) {
          logChan.send({
            embeds: [
              new MessageEmbed()
                .setTitle("Vouch set!")
                .addField("Set by", int.user.tag + " <@" + int.user.id + ">")
                .addField("Set to", toVouch.tag + " <@" + toVouch.id + ">")
                .addField(
                  "Reason",
                  `${reason ? reason : "No reason provided."}`
                )
                .setThumbnail(int.member.displayAvatarURL()),
            ] /*
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("LINK")
                .setLabel("Jump to message")
                .setURL(
                  `https://discord.com/channels/${int.guild.id}/${int.channel.id}/${sent.id}`
                )
            ),
          ],*/,
          });
        }
      }
  }
};

module.exports = {
  name,
  description,
  builder,
  onInteraction,
};
