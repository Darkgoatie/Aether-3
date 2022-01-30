const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction } = require("discord.js");
const config = require("../config.json");

const name = "user";
const description = "User commands menu";
const builder = 
    new SlashCommandBuilder()
        .setName(name)
        .setDescription(description)
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("info")
                .setDescription("Shows user info")
                .addUserOption(opt => opt.setName("user").setDescription("This user's info will be displayed!").setRequired(true))
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("roles")
                .setDescription("Shows the user's roles")
                .addUserOption(opt => opt.setName("user").setDescription("This user's roles will be displayed!").setRequired(true))
        )


const onInteraction = async ({ int }) => {
    const SafetyColors = [
        '#FF000',
        '#FF7518',
        '#FFFF00',
        '#00FF00',
        '#00FFFF' 
    ];

    const checkSafetyBtn = new MessageButton()
        .setCustomId(`userInfoCheckSafetyBtn-${int.user.id}`)
        .setLabel("Security level of user")
        .setEmoji("936339253456146442")
        .setStyle("PRIMARY");

    const row = new MessageActionRow()
        .addComponents(checkSafetyBtn);

    if (int.options.getSubcommand() === 'info') {
        int.reply({ content: "Command was successful!", ephemeral: true });
        const user = int.options.getUser('user');
        if ( user ) 
        {
            const sentMessage = await int.channel.send({
                embeds: [
                    new MessageEmbed()
                    .setTitle("User Info")
                    .setFooter({ iconURL: process.env.iconURL, text: "Thank you for using Aether!" })
                    .setColor("RANDOM")
                    .addField("ID", user.id, true)
                    .addField("Tag", user.tag, true)
                    .addField("Profile Picture", `[URL](${user.avatarURL()})`, true)
                    .setThumbnail(user.avatarURL()) 
                    .setAuthor({ iconURL: int.user.displayAvatarURL(), "name": `Command used by ${int.user.tag}` })
                ],
                components: [
                    row
                ]
            })
            
            const filter = i => i.customId.startsWith("userInfoCheckSafetyBtn") && i.customId.endsWith(int.user.id);
            const collector = int.channel.createMessageComponentCollector({ filter, time: 15e3 });

            collector.on('collect', async i => {
                row.components[0].setDisabled();                
                sentMessage.edit({ components: [ row ], embeds: [                     
                    new MessageEmbed()
                    .setTitle("User Info")
                    .setFooter({ iconURL: process.env.iconURL, text: "Thank you for using Aether!" })
                    .setColor("RANDOM")
                    .addField("ID", user.id, true)
                    .addField("Tag", user.tag, true)
                    .addField("Profile Picture", `[URL](${user.avatarURL()})`, true)
                    .setThumbnail(user.avatarURL()) 
                    .setAuthor({ iconURL: int.user.displayAvatarURL(), "name": `Command used by ${int.user.tag}` })
                ]});
                let safetyLVL = 0;
                if (Date.now() - user.createdAt > 1000*60*60*24*120) safetyLVL += 1;
                if (Date.now() - user.createdAt > 1000*60*60*24*240) safetyLVL += 1;
                if (Date.now() - user.createdAt > 1000*60*60*24*360) safetyLVL += 1;
                if (user.avatarURL() !== null ) safetyLVL += 1;

                i.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Security level of user")
                            .setFooter({ iconURL: process.env.iconURL, text: "Thank you for using Aether!" })
                            .setDescription(
                                `Is not an automation +1
                                Account older than:
                                120 days: ${Date.now() - user.createdAt > 1000*60*60*24*120 ? "+1" : "+0"}
                                240 days: ${Date.now() - user.createdAt > 1000*60*60*24*240 ? "+1" : "+0"}
                                360 days: ${Date.now() - user.createdAt > 1000*60*60*24*360 ? "+1" : "+0"}
                                Profile Picture is not default: ${user.avatarURL() !== null ? "+1" : "+0"} 
                                --------------------------
                                Total Security Score: ${safetyLVL + 1}/5
                                `
                            )
                            .setThumbnail(user.displayAvatarURL())
                            .setAuthor({ iconURL: int.user.displayAvatarURL(), "name": `Command used by ${int.user.tag}` })
                            .setColor(SafetyColors[safetyLVL])
                    ]
                })
                
            });

            collector.on('end', async () => {
                row.components[0].setDisabled();
                sentMessage.edit({ components: [ row ], embeds: [                     
                    new MessageEmbed()
                    .setTitle("User Info")
                    .setFooter({ iconURL: process.env.iconURL, text: "Thank you for using Aether!" })
                    .setColor("RANDOM")
                    .addField("ID", user.id, true)
                    .addField("Tag", user.tag, true)
                    .addField("Profile Picture", `[URL](${user.avatarURL()})`, true)
                    .setAuthor({ iconURL: int.user.displayAvatarURL(), "name": `Command used by ${int.user.tag}` })
                    .setThumbnail(user.avatarURL()) 
                ]});
            });
        }
    } else if (int.options.getSubcommand() === 'roles') {
        const user = int.options.getUser("user")
        const mem = await int.guild.members.fetch(user.id);
        if(!mem) return;
        const roles = [];
        mem.roles.cache.forEach(rl => {
            rl.name !== '@everyone' ? roles.push(`<@&${rl.id}> - ${rl.id}`) : undefined; // Remove @everyone from role list
        });
        int.reply({
            embeds: [
                new MessageEmbed()
                    .setTimestamp(new Date())
                    .setAuthor({ iconURL: int.user.displayAvatarURL(), "name": `Command used by ${int.user.tag}` })
                    .setFooter({ iconURL: process.env.iconURL, text: "Thank you for using Aether!" })
                    .setDescription(roles.join(" \n"))
                    .setTitle(`Roles of ${user.tag}`)
            ]
        })
    }
}

module.exports = {
    name,
    description,
    builder,
    onInteraction
}