const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v9");
const { Permissions, MessageEmbed } = require("discord.js");
const ms = require("ms");

const name = "giveaway";
const description = "Giveaway"
const builder = 
    new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("start")
                .setDescription("Starts a giveaway")
                // .addNumberOption(opt => opt.setName("days").setDescription("Giveaway Length").setRequired(true).setMinValue(0).setMaxValue(6))
                // .addNumberOption(opt => opt.setName("hours").setDescription("Giveaway Length").setRequired(true).setMinValue(0).setMaxValue(23))
                // .addNumberOption(opt => opt.setName("minutes").setDescription("Giveaway Length").setRequired(true).setMinValue(0).setMaxValue(59))
                .addStringOption(opt => opt.setName("time").setDescription("The time the giveaway will end in.").setRequired(true))
                .addStringOption(opt => opt.setName("prize").setDescription("The Prize of the giveaway").setRequired(true))
                .addNumberOption(opt => opt.setName("winners").setDescription("The amount of winners in this giveaway").setMaxValue(10).setMinValue(1))
                .addChannelOption(opt => opt.setName("channel").setDescription("The channel to put the giveaway in").addChannelType(ChannelType.GuildText))
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("end")
                .setDescription("Ends an active giveaway")
                .addStringOption(opt => opt.setName("id").setDescription("The ID of the giveaway that will be ended").setRequired(true))
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("reroll")
                .setDescription("Rerolls an ended giveaway")
                .addStringOption(opt => opt.setName("id").setDescription("The ID of the giveaway that will be rerolled").setRequired(true))
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("list")
                .setDescription("Lists filtered giveaways")
                .addChannelOption(opt => opt.setName("channel").setDescription("Filter to see the giveaways of a channel.").addChannelType(ChannelType.GuildText))
                .addStringOption(opt => opt.setName("prize").setDescription("Filter to see the giveaways of a prize."))
                .addBooleanOption(opt => opt.setName("ended").setDescription("Filter to see the giveaways that are ended or not."))
        )

const onInteraction = async ({ int, client }) => {
    if(int.options.getSubcommand() === 'start') 
    {
        if(!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return int.reply({ ephemeral: true, content: "You need manage messages permissions to use this command!" });
        const gwLength = parseInt(ms(int.options.getString("time")));
        const winners = int.options.getNumber("winners") ? parseInt(int.options.getNumber("winners")) : 1;
        const prize = int.options.getString("prize");
        const giveawayChannel = int.options.getChannel("channel");

        if(isNaN(gwLength)) return int.reply({ content: "Inputted time is not a valid amount of time! Try using these: \n 1d, 1d12h, 30m, 6h", ephemeral: true });
        if(gwLength > parseInt(ms("7d"))) return int.reply({ content: "This time is too long! Maximum length of a giveaway shall be a week (7 days)!", ephemeral: true });
        client.giveawaysManager.start(giveawayChannel ? giveawayChannel : int.channel, {
            duration: gwLength,
            winnerCount: winners,
            prize,
            messages: {
                giveawayEnded: "<:AetherGift:866637037607845929><:AetherGift:866637037607845929>Giveaway ended!<:AetherGift:866637037607845929><:AetherGift:866637037607845929>",
                giveaway: "<:AetherGift:866637037607845929><:AetherGift:866637037607845929>Giveaway!<:AetherGift:866637037607845929><:AetherGift:866637037607845929>",
                inviteToParticipate: "React with <:AetherGift:866637037607845929> to join!"
            },
            extraData: {
                hostedBy: int.user.id,
            }
        });
        int.reply({ content: `A giveaway has been successfully started in <#${ giveawayChannel ? giveawayChannel.id : int.channel.id}> !`, ephemeral: true });
    } 
    else if (int.options.getSubcommand() === 'end') 
    {
        let messageId = int.options.getString("id");
        messageId = messageId.includes("-") ? messageId.split("-")[1]: messageId;
        if(!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return int.reply({ ephemeral: true, content: "You need manage messages permissions to use this command!" });
        client.giveawaysManager.end(messageId)
            .then(() => {
                int.reply({ ephemeral: true, content: `Giveaway with id "${messageId}" was ended!`  });
            }).catch((err) => {
                int.reply({ ephemeral: true, content: `This giveaway was not found!` });
            });
    } 
    else if (int.options.getSubcommand() === 'reroll') 
    {
        let messageId = int.options.getString("id");
        messageId = messageId.includes("-") ? messageId.split("-")[1]: messageId;
        if(!int.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return int.reply({ ephemeral: true, content: "You need manage messages permissions to use this command!" });
        client.giveawaysManager.reroll(messageId)
            .then(() => {
                int.reply({ ephemeral: true, content: `Giveaway with id "${messageId}" was rerolled!` });
            }).catch((err) => {
                int.reply({ ephemeral: true, content: `This giveaway was not found!` });
            });
    } 
    else if (int.options.getSubcommand() === 'list') 
    {
        let gws = client.giveawaysManager.giveaways;
        const ftrChannel = int.options.getChannel("channel");
        const ftrPrize = int.options.getString("prize");
        const ftrEnded = int.options.getBoolean("ended");
        gws = gws.filter((gw) => gw.guildId === int.guild.id);
        if (ftrChannel !== null) gws = gws.filter((gw) => gw.channelId == ftrChannel.id);
        if (ftrPrize !== null) gws = gws.filter((gw) => gw.prize == ftrPrize);
        if (ftrEnded !== null) gws = gws.filter((gw) => gw.ended === ftrEnded);
        if (gws.length < 1) return int.reply("Couldn't find any giveaways matching these tags!");
        let n = 0;
        gws = gws.map((gw) => {
            n++;
            return ({
                val: `Channel: <#${gw.channelId}>, Prize: ${gw.prize} `,
                nm: `Giveaway #${n}`
            })
        });

        // This part was the hardest code i ever wrote :(
        const embeds = [];
        for (let embedCount = 0; embedCount < 10 && gws.length > 0; embedCount++) {
            const emb = new MessageEmbed()
                .setTitle("Giveaways list")
                .setFooter({ text: `Page ${embedCount}` });

            for (let fieldCount = 0; fieldCount < 25 && gws.length > 0; fieldCount) {
                const data = gws.shift();
                emb.addField(data.nm, data.val, true);
            };
            embeds.push(emb);
        };
        int.reply({
            embeds
        })
    }
}

module.exports = {
    name,
    description,
    builder,
    onInteraction
}