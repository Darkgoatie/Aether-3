const { getClientData } = require("../../../utils/getClientData");

const onGiveawayEnded = async (giveaway, winners) => {
  const {
    MessageEmbed,
    MessageActionRow,
    MessageButton,
  } = require("discord.js");
  let time = 0;
  const clientData = await getClientData();
  winners.forEach((member) => {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setStyle("LINK")
        .setURL(
          `https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`
        )
        .setLabel("Jump to giveaway")
        .setEmoji("866637037607845929"),
      new MessageButton()
        .setStyle("LINK")
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${clientData.id}&permissions=8&scope=bot%20applications.commands`
        )
        .setLabel("Invite Aether")
        .setEmoji("937284368202891295")
    );

    time += 3e3;
    setTimeout(() => {
      member.send({
        embeds: [
          new MessageEmbed()
            .setTitle("Giveaway Results!")
            .setThumbnail(member.displayAvatarURL())
            .setDescription(
              `Congrats, **${member.user.tag}**! You are one of the winners of the giveaway for **__${giveaway.prize}__**!`
            )
            .setAuthor({
              iconURL:
                "https://cdn.discordapp.com/avatars/805537268349665290/71fb39825db04396548d25d604a139bb.webp",
              name: "Giveaway was hosted with Aether",
              url: `https://discord.com/api/oauth2/authorize?client_id=${clientData.id}&permissions=8&scope=bot%20applications.commands`,
            }),
        ],
        components: [row],
      });
    }, time);
  });
};

const name = "giveawayEnded";

module.exports = {
  name,
  callBack: onGiveawayEnded,
};
