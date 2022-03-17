const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

const name = 'help';
const description = 'Shows the help menu';
const builder = new SlashCommandBuilder().setName(name).setDescription(description);

const onInteraction = async ({ int }) => {
	const nextPageBtn = new MessageButton()
		.setCustomId(`helpNextPageBtn ${int.user.id}`)
		.setLabel('next page')
		.setStyle('SECONDARY')
		.setEmoji('935822618223849582');

	const prevPageBtn = new MessageButton()
		.setCustomId(`helpPrevPageBtn-${int.user.id}`)
		.setLabel('previous page')
		.setStyle('SECONDARY')
		.setEmoji('935822573827141632');

	const row = new MessageActionRow().addComponents(prevPageBtn, nextPageBtn);

	let pageNo = 1;

	function createBaseEmbed() {
		return new MessageEmbed()
			.setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL() })
			.setTitle('Help menu')
			.setDescription(
				'[Invite Aether!](https://aether.vercel.app/invite) / [Join the support server!](https://aether.vercel.app/support)'
			)
			.setTimestamp(new Date())
			.setColor('RANDOM');
	}

	const pages = [
		{
			no: 1,
			content: createBaseEmbed()
				.addField(
					'User',
					"Subcommands: \n/user info <User> - Displays someone's user info \n/user roles <User> - Displys someone's roles in current guild (with IDs) "
				)
				.addField(
					'Giveaway',
					'Subcommands: \n/giveaway start <Options> - Starts a giveaway \n/giveaway end <Options> - Ends a giveaway\n/giveaway reroll <Options> - Rerolls a giveaway that has already ended.\n/giveaway setemoji <EmojiName> - Sets a new default giveaway emoji for current server.'
				)
				.addField('Invite', '/invite - Sends invite links of the bot and the support server')
				.setFooter({
					iconURL: process.env.iconURL,
					text: 'Page 1/3 | Thank you for using Aether!'
				})
		},
		{
			no: 2,
			content: createBaseEmbed()
				.addField(
					'Auction',
					"Subcommands: \n/auction start <Options> - Starts an auction in the current/given channel\n/auction bid <Amount> - Bids on the auction of the current channel\n/auction end <Channel> - Ends the auction of the current/given channel\n/auction setprice <Options> - Sets a new price to an auction\n/auction autoend <Options> - Sets an end timer for current channel's auction"
				)
				.addField(
					'Vouch',
					'Subcommands: \n/vouch give <Options> - (Same as old +1) Vouches someone\n/vouch check <Options> - Check the vouches of someone\n/vouch set <Options> - Set the vouches of someone\n/vouch config <Options> - Configure the vouch settings of this guild'
				)
				.setFooter({
					iconURL: process.env.iconURL,
					text: 'Page 2/3 | Thank you for using Aether!'
				})
		},
		{
			no: 3,
			content: createBaseEmbed().setFooter({
				iconURL: process.env.iconURL,
				text: 'Page 3/3 | Thank you for using Aether!'
			})
		}
	];

	const sentMessage = await int.channel.send({
		components: [ row ],
		embeds: [ pages.find((page) => page.no == pageNo).content ]
	});
	int.reply({ content: 'A help menu was sent!', ephemeral: true });
	const filter = (i) => i.customId.startsWith('help') && i.customId.endsWith(int.user.id);
	const collector = int.channel.createMessageComponentCollector({
		filter,
		time: 15e3
	});

	collector.on('collect', async (i) => {
		if (i.customId.startsWith('helpPrev')) {
			if (pageNo === 1) {
				i.update({
					components: [ row ],
					embeds: [ pages.find((page) => page.no == pageNo).content ]
				});
			} else {
				pageNo--;
				i.update({
					components: [ row ],
					embeds: [ pages.find((page) => page.no == pageNo).content ]
				});
			}
		} else if (i.customId.startsWith('helpNext')) {
			if (pageNo === 3) {
				i.update({
					components: [ row ],
					embeds: [ pages.find((page) => page.no == pageNo).content ]
				});
			} else {
				pageNo++;
				i.update({
					components: [ row ],
					embeds: [ pages.find((page) => page.no == pageNo).content ]
				});
			}
		}
	});

	collector.on('end', async (collected) => {
		row.components.forEach((comp) => {
			comp.setDisabled();
		});
		sentMessage.edit({
			components: [ row ],
			embeds: [ pages.find((page) => page.no == pageNo).content ]
		});
	});
};

module.exports = {
	name,
	description,
	onInteraction,
	builder
};
