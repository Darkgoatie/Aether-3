const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const auctionManager = require("../auctionManager.js");
const ms = require("ms");

const name = "auction"
const description = "Base Auction Command"
const builder = 
    new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("start")
                .setDescription("Starts an auction in a channel.")
                .addIntegerOption(opt => opt.setName("startingprice").setDescription("The Starting price of the auction").setMinValue(1).setRequired(true))
                .addStringOption(opt => opt.setName("item").setDescription("The Item to be auctioned").setRequired(true))
                .addChannelOption(opt => opt.addChannelType(ChannelType.GuildText).setName("channel").setDescription("The Channel to start the auction in. if left blank, auction will be started in current channel"))
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("bid")
                .setDescription("Bid for the auction in the current channel.")
                .addIntegerOption(opt => opt.setName("amount").setDescription("The amount to be offered to the auction").setRequired(true))
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("end")
                .setDescription("Ends the auction of a channel.")
                .addChannelOption(opt => opt.addChannelType(ChannelType.GuildText).setName("channel").setDescription("The channel to end the giveaway of. if left blank, current channel will be used."))
        );

const onInteraction = async ({ int }) => {
    require('dotenv').config();
    if (int.options.getSubcommand() === 'start') {
        if (!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return int.reply({ ephemeral: true, content: "You don't have the manage messages permissions that are required for this command!" });
        const channel = int.options.getChannel("channel") !== null ? int.options.getChannel("channel") : int.channel;
        await int.deferReply();
        let auc = await auctionManager.find({ channelId: channel.id }).exec();
        if (auc[0] !== undefined) return int.editReply({ ephemeral: true, content: "There is already an active auction in this channel!" });
        const bid = int.options.getInteger("startingprice");
        const itm = int.options.getString("item");
        int.editReply({ ephemeral: true, content: "Auction was started!" });
        const sent = await channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Auction started!")
                    .setThumbnail(int.guild.iconURL() !== null ? int.guild.iconURL() : process.env.iconURL)
                    .setAuthor({
                        iconURL: process.env.iconURL,
                        name: `Auction hosted using Aether`,
                        url: "https://aether.vercel.app/invite"
                    })
                    .addField("Starting bid", `${bid}`)
                    .addField("Item", itm)
                    .addField("Hosted by", int.user.tag)
                    .setColor("RANDOM")
            ]
        });
        await auctionManager.create({
            messageId: sent.id,
            channelId: channel.id,
            guildId: int.guild.id,
            hostedBy: int.user.id,
            item: itm,
            price: bid,
            totalBids: 0,
            startedAt: Date.now()
        });
    }
    else if (int.options.getSubcommand() === 'bid') 
    {
        const auc = (await auctionManager.find({ channelId: int.channel.id }).exec())[0];
        if (auc === undefined) return int.reply({ ephemeral: true, content: "Couldn't find any active auctions in this channel!"});
        const bid = int.options.getInteger("amount");
        if (bid <= auc.price) return int.reply({ ephemeral: true, content: `You should give a higher amount than the current bid! The current bid is ${auc.price}`});
        await int.deferReply();
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle("LINK")
                    .setLabel("Jump to auction")
                    .setEmoji("866635643919794176")
                    .setURL(`https://discord.com/channels/${auc.guildId}/${auc.channelId}/${auc.messageId}`)
            );
        await auctionManager.updateOne({ channelId: int.channel.id }, { winner: int.user.id, price: bid, totalBids: auc.totalBids + 1 });
        int.editReply({
            embeds: [
                new MessageEmbed()
                    .setTitle("New bid!")
                    .setAuthor({
                        iconURL: process.env.iconURL,
                        name: `Auction hosted using Aether`,
                        url: "https://aether.vercel.app/invite"
                    })
                    .setThumbnail(int.guild.iconURL() !== null ? int.guild.iconURL() : process.env.iconURL)
                    .setColor("RANDOM")
                    .setDescription(`New bid for **${auc.item}** by __${int.user.tag}__!`)
            ],
            components: [
                row
            ]
        });
    }
    else if (int.options.getSubcommand())
    {
        const channel = int.options.getChannel("channel") !== null ? int.options.getChannel("channel") : int.channel;
        const auc = (await auctionManager.find({ channelId: channel.id }).exec())[0];
        console.log(auc)
        if (auc === undefined) return int.reply({ ephemeral: true, content: "Couldn't find any active auctions in this channel!"});
        if (auc.hostedBy !== int.user.id && !int.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return int.reply({ ephemeral: true, content: "You should either have started the auction, or should have manage guild permissions to end it!" });
        await int.deferReply();
        const sent = await channel.send({
            embeds: [
                new MessageEmbed()
                    .setTitle("Auction ended!")
                    .setThumbnail(int.guild.iconURL() !== null ? int.guild.iconURL() : process.env.iconURL)
                    .setAuthor({
                        iconURL: process.env.iconURL,
                        name: `Auction hosted using Aether`,
                        url: "https://aether.vercel.app/invite"
                    })
                    .addField(`Sold at (Price)`, `${auc.price}`)
                    .addField(`Sold to`, auc.winner !== undefined ? auc.winner : "No one!")
                    .addField("Item sold", auc.item)
                    .addField("Total bids", `${auc.totalBids}`)
                    .addField("Hosted by", `${int.user.tag}`)
                    .addField(`Time since auction was started`, `${ms(Date.now() - auc.startedAt)}`)
            ]
        });
        await auctionManager.deleteOne({ channelId: channel.id });
        int.editReply({ 
            ephemeral: true, 
            content: "Auction was successfully ended!", 
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setStyle("LINK")
                            .setLabel("Jump to auction")
                            .setEmoji("866635643919794176")
                            .setURL(`https://discord.com/channels/${auc.guildId}/${auc.channelId}/${sent.id}`)
                    )
            ] 
        });

    }
};

module.exports = {
    name,
    description,
    builder,
    onInteraction
}