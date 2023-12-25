const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const {
  Permissions,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const ms = require("ms");

const makeField = (name, val) => {
  return {
    name: name,
    value: val,
  };
};
const name = "auction";
const description = "Base Auction Command";
const builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("start")
      .setDescription("Starts an auction in a channel.")
      .addIntegerOption((opt) =>
        opt
          .setName("startingprice")
          .setDescription("The Starting price of the auction")
          .setMinValue(1)
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("item")
          .setDescription("The Item to be auctioned")
          .setRequired(true)
      )
      .addChannelOption((opt) =>
        opt
          .addChannelTypes(ChannelType.GuildText)
          .setName("channel")
          .setDescription(
            "The Channel to start the auction in. if left blank, auction will be started in current channel"
          )
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("bid")
      .setDescription("Bid for the auction in the current channel.")
      .addIntegerOption((opt) =>
        opt
          .setName("amount")
          .setDescription("The amount to be offered to the auction")
          .setRequired(true)
      )
      .addBooleanOption((opt) =>
        opt
          .setName("anonymous")
          .setDescription(
            "If you want to create an anonymous bid. Your name will be hidden"
          )
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("setprice")
      .setDescription("Re-sets the auction price on current channel.")
      .addIntegerOption((opt) =>
        opt
          .setName("amount")
          .setDescription("The amount to set")
          .setRequired(true)
          .setMinValue(0)
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("end")
      .setDescription("Ends the auction of a channel.")
      .addChannelOption((opt) =>
        opt
          .addChannelTypes(ChannelType.GuildText)
          .setName("channel")
          .setDescription(
            "The channel to end the giveaway of. if left blank, current channel will be used."
          )
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("autoend")
      .setDescription("Sets a time for the auction to end automatically")
      .addStringOption((opt) =>
        opt
          .setName("time")
          .setDescription("The time to auto end the auction at. Ex: 1h, 1d12h")
          .setRequired(true)
      )
  );

const onInteraction = async ({ int, client }) => {
  const auctionManager = require("../managers/auctionManager.js");
  require("dotenv").config();
  const subcommand = int.options.getSubcommand();

  const findActiveAuction = async (channelId) => {
    const auc = (await auctionManager.find({ channelId }).exec())[0];
    return auc;
  };

  const replyEphemeral = (content) => {
    int.reply({ ephemeral: true, content });
  };

  switch (subcommand) {
    case "start":
      if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
        return replyEphemeral(
          "You don't have the manage messages permissions required for this command!"
        );
      }

      channel = int.options.getChannel("channel") || int.channel;
      auc = await findActiveAuction(channel.id);
      if (auc) {
        return replyEphemeral(
          "There is already an active auction in this channel!"
        );
      }

      bid = int.options.getInteger("startingprice");
      itm = int.options.getString("item");
      await int.reply({ ephemeral: true, content: "Auction started!" });

      sent = await channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle("Auction started!")
            .setThumbnail(int.guild.iconURL() || process.env.iconURL)
            .setAuthor({
              iconURL: process.env.iconURL,
              name: `Auction hosted using Aether`,
              url: "https://discord.com/invite/Vmfe56uMf6",
            })
            .addFields([
              {
                name: "Starting bid",
                value: `${bid}`,
              },
              { name: "Item", value: itm },
              { name: "Hosted by", value: int.user.tag },
            ])
            .setColor("RANDOM"),
        ],
      });

      await auctionManager.create({
        messageId: sent.id,
        channelId: channel.id,
        guildId: int.guild.id,
        hostedBy: int.user.id,
        item: itm,
        price: bid,
        totalBids: 0,
        startedAt: Date.now(),
      });
      break;

    case "bid":
      auc = (
        await auctionManager.find({ channelId: int.channel.id }).exec()
      )[0];
      if (auc === undefined)
        return int.reply({
          ephemeral: true,
          content: "Couldn't find any active auctions in this channel!",
        });
      bid = int.options.getInteger("amount");
      if (bid <= auc.price)
        return int.reply({
          ephemeral: true,
          content: `You should give a higher amount than the current bid! The current bid is ${auc.price}`,
        });
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setStyle("LINK")
          .setLabel("Jump to auction")
          .setEmoji("866635643919794176")
          .setURL(
            `https://discord.com/channels/${auc.guildId}/${auc.channelId}/${auc.messageId}`
          )
      );
      await auctionManager.updateOne(
        { channelId: int.channel.id },
        {
          winner: int.user.id,
          price: bid,
          totalBids: auc.totalBids + 1,
        }
      );
      const isAnonymous =
        int.options.getBoolean("anonymous") == true ? true : false;
      if (isAnonymous === false) {
        await int.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("New bid!")
              .setAuthor({
                iconURL: process.env.iconURL,
                name: `Auction hosted using Aether`,
                url: "https://discord.com/invite/Vmfe56uMf6",
              })
              .setThumbnail(
                int.guild.iconURL() !== null
                  ? int.guild.iconURL()
                  : process.env.iconURL
              )
              .setColor("RANDOM")
              .setDescription(
                `New bid for **${auc.item}** by __${int.user.tag}__!`
              )
              .addFields([{ name: "Amount", value: `${bid}` }]),
          ],
          components: [row],
        });
      } else if (isAnonymous === true) {
        await int.reply({
          ephemeral: true,
          content: "Your bid was anonymously created!",
        });

        await int.channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle("New bid!")
              .setAuthor({
                iconURL: process.env.iconURL,
                name: `Auction hosted using Aether`,
                url: "https://discord.com/invite/Vmfe56uMf6",
              })
              .setThumbnail(
                int.guild.iconURL() !== null
                  ? int.guild.iconURL()
                  : process.env.iconURL
              )
              .setColor("RANDOM")
              .setDescription(`New bid for **${auc.item}** by __Anonymous__!`)
              .addFields([
                {
                  name: "Amount",
                  value: `${bid}`,
                },
              ]),
          ],
          components: [row],
        });
      }
      break;

    case "end":
      channel =
        int.options.getChannel("channel") !== null
          ? int.options.getChannel("channel")
          : int.channel;
      auc = (await auctionManager.find({ channelId: channel.id }).exec())[0];
      if (auc === undefined)
        return int.reply({
          ephemeral: true,
          content: "Couldn't find any active auctions in this channel!",
        });
      if (
        auc.hostedBy !== int.user.id &&
        !int.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
      )
        return int.reply({
          ephemeral: true,
          content:
            "You should either have started the auction, or should have manage guild permissions to end it!",
        });
      sent = await channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle("Auction ended!")
            .setThumbnail(
              int.guild.iconURL() !== null
                ? int.guild.iconURL()
                : process.env.iconURL
            )
            .setAuthor({
              iconURL: process.env.iconURL,
              name: `Auction hosted using Aether`,
              url: "https://discord.com/invite/Vmfe56uMf6",
            })
            .addFields([
              makeField(`Sold at (Price)`, `${auc.price}`),
              makeField(
                `Sold to`,
                auc.winner !== undefined ? `<@${auc.winner}>` : "No one!"
              ),
              makeField("Item sold", auc.item),
              makeField("Total bids", `${auc.totalBids}`),
              makeField("Hosted by", `${int.user.tag}`),
              makeField(
                `Time since auction was started`,
                `${ms(Date.now() - auc.startedAt)}`
              ),
            ]),
        ],
      });
      await auctionManager.deleteOne({ channelId: channel.id });
      await int.reply({
        ephemeral: true,
        content: "Auction was successfully ended!",
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle("LINK")
              .setLabel("Jump to auction")
              .setEmoji("866635643919794176")
              .setURL(
                `https://discord.com/channels/${auc.guildId}/${auc.channelId}/${auc.messageId}`
              )
          ),
        ],
      });
      if (auc.winner === undefined) return;
      client.users.fetch(auc.winner).then((usr) =>
        usr.send({
          content: `You're the winner to the auction for ${auc.item} with the highest bid of ${auc.price}`,
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle("LINK")
                .setLabel("Jump to auction")
                .setEmoji("866635643919794176")
                .setURL(
                  `https://discord.com/channels/${auc.guildId}/${auc.channelId}/${auc.messageId}`
                )
            ),
          ],
        })
      );
      break;

    case "autoend":
      const time = ms(int.options.getString("time"));
      if (typeof time != "number")
        return int.reply({
          ephemeral: true,
          content: "Not a valid amt of time!",
        });
      if (time > ms("1w"))
        return int.reply({
          ephemeral: true,
          content: "Time can't be longer than a week!",
        });
      auc = (
        await auctionManager.find({ channelId: int.channel.id }).exec()
      )[0];
      if (auc === undefined)
        return int.reply({
          ephemeral: true,
          content: "Couldn't find any active auctions in this channel!",
        });
      if (
        auc.hostedBy !== int.user.id &&
        !int.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
      )
        return int.reply({
          ephemeral: true,
          content:
            "You should either have started the auction, or should have manage guild permissions to end it!",
        });

      await int.reply({
        content: "A timer was started!",
        ephemeral: true,
      });
      smsg = await int.channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle("Auction end timer")
            .setDescription(`Ends in ${ms(time)}`)
            .setColor("RANDOM"),
        ],
      });

      await auctionManager.updateOne(
        {
          channelId: int.channel.id,
        },
        {
          autoEndSettings: {
            autoEnd: true,
            endAt: Date.now() + time,
            timer: {
              messageId: smsg.id,
            },
          },
        }
      );
      break;

    case "setprice":
      auc = (
        await auctionManager.find({ channelId: int.channel.id }).exec()
      )[0];
      if (auc === undefined)
        return int.reply({
          ephemeral: true,
          content: "Couldn't find any active auctions in this channel!",
        });
      if (
        auc.hostedBy !== int.user.id &&
        !int.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
      )
        return int.reply({
          ephemeral: true,
          content:
            "You should either have started the auction, or should have manage guild permissions to edit it!",
        });
      const amount = int.options.getInteger("amount");

      await int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Auction price re-set!")
            .addFields([makeField("New Price", `${amount}`)]),
        ],
      });

      await auctionManager.updateOne(
        {
          channelId: int.channel.id,
        },
        {
          price: amount,
        }
      );
      break;

    default:
      // Handle unknown subcommand
      break;
  }
};

module.exports = {
  name,
  description,
  builder,
  onInteraction,
};
