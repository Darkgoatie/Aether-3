const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const name = 'invite';
const description = 'Sends an invite link of the bot';

const builder = new SlashCommandBuilder().setName(name).setDescription(description);

const onInteraction = async ({ int }) => {
	await int.reply({
		embeds: [
			new MessageEmbed()
				.setTitle('Invites')
				.addField('Invite the bot to your own server', `[Invite](https://aether.vercel.app/invite)`)
				.addField('Join the support server', '[Click to join!](https://aether.vercel.app/support)')
		],
		components: [
			new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setStyle('LINK')
						.setLabel('Invite Aether')
						.setURL(
							'https://discord.com/api/oauth2/authorize?client_id=805537268349665290&permissions=8&scope=bot%20applications.commands'
						)
				)
				.addComponents(
					new MessageButton()
						.setStyle('LINK')
						.setLabel('Join the support server')
						.setURL('https://discord.com/invite/Dn3VJmP3Ba')
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
