const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  CommandInteraction,
} = require("discord.js");

const name = "user";
const description = "Base User Command";
const builder = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("info")
      .setDescription("Shows user info")
      .addUserOption((opt) =>
        opt
          .setName("user")
          .setDescription("This user's info will be displayed!")
          .setRequired(true)
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("roles")
      .setDescription("Shows the user's roles")
      .addUserOption((opt) =>
        opt
          .setName("user")
          .setDescription("This user's roles will be displayed!")
          .setRequired(true)
      )
  );

const onInteraction = async ({ int, client }) => {
  const SafetyColors = ["#FF000", "#FF7518", "#FFFF00", "#00FF00", "#00FFFF"];

  const checkSafetyBtn = new MessageButton()
    .setCustomId(`userInfoCheckSafetyBtn-${int.user.id}`)
    .setLabel("Security level of user")
    .setEmoji("936339253456146442")
    .setStyle("PRIMARY");

  const row = new MessageActionRow().addComponents(checkSafetyBtn);
  switch (int.options.getSubcommand()) {
    case "info":
      user = int.options.getUser("user");
      if (!user) {
        user = int.user;
      }
      int.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("User Info")
            .setFooter({
              iconURL:
                "https://cdn.discordapp.com/avatars/805537268349665290/71fb39825db04396548d25d604a139bb.webp",
              text: "Thank you for using Aether!",
            })
            .setColor("RANDOM")
            .addField("ID", user.id, true)
            .addField("Tag", user.tag, true)
            .addField("Profile Picture", `[URL](${user.avatarURL()})`, true)
            .setThumbnail(user.avatarURL())
            .setAuthor({
              iconURL: int.user.displayAvatarURL(),
              name: `Command used by ${int.user.tag}`,
            }),
        ], //  components: [row],
      });
      break;
    case "roles":
      user = int.options.getUser("user");
      mem = await int.guild.members.fetch(user.id);
      if (!mem) return;
      roles = [];
      mem.roles.cache.forEach((rl) => {
        rl.name !== "@everyone"
          ? roles.push(`<@&${rl.id}> - ${rl.id}`)
          : undefined; // Remove @everyone from role list
      });
      int.reply({
        embeds: [
          new MessageEmbed()
            .setTimestamp(new Date())
            .setAuthor({
              iconURL: int.user.displayAvatarURL(),
              name: `Command used by ${int.user.tag}`,
            })
            .setFooter({
              iconURL:
                "https://cdn.discordapp.com/avatars/805537268349665290/71fb39825db04396548d25d604a139bb.webp",
              text: "Thank you for using Aether!",
            })
            .setDescription(roles.join(" \n"))
            .setTitle(`Roles of ${user.tag}`),
        ],
      });
  }
};

module.exports = {
  name,
  description,
  builder,
  onInteraction,
};
