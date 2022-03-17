const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const name = 'stats';
const description = 'Shows bot statistics';
const builder = new SlashCommandBuilder().setName(name).setDescription(description);
const onInteraction = ({ int, client }) => {
	return int.reply({
		embeds: [
			new MessageEmbed()
				.setTitle('Aether Statistics')
				.setColor('RANDOM')
				.setThumbnail(client.user.avatarURL())
				.addField('Guilds', `${client.guilds.cache.size} Guilds`, true)
		],
		components: [
			new MessageActionRow().addComponents(
				new MessageButton()
					.setLabel('Invite aether')
					.setStyle('LINK')
					.setURL(
						`https://discord.com/api/oauth2/authorize?client_id=${client.user
							.id}&permissions=8&scope=bot%20applications.commands`
					)
					.setEmoji('937284368202891295')
			)
		]
	});
};

module.exports = {
	name,
	description,
	builder,
	onInteraction
};
