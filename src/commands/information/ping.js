const Command = require('../../structures/CommandClass');

const { EmbedBuilder, InteractionContextType } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');

module.exports = class Ping extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('ping')
				.setDescription('Returns the bot ping.')
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
			usage: 'ping',
			category: 'Information',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const now = Date.now();
		const pingEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${client.user.username}'s Ping`,
				iconURL: client.user.displayAvatarURL({ size: 2048 }),
			})
			.setColor('#fee75c')
			.setDescription(stripIndents`
            **⏱ Roundtrip:** ${Math.round(Date.now() - now)} ms
            **💓 API:** ${Math.round(client.ws.ping)} ms
            `);

		return await interaction.reply({ embeds: [pingEmbed] });
	}
};
