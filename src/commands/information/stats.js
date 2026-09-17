const Command = require('../../structures/CommandClass');

const { EmbedBuilder, InteractionContextType } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
const { version } = require('../../../package.json');

module.exports = class Stats extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('stats')
				.setDescription('Check statistics of the bot')
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
			usage: 'stats',
			category: 'Information',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const embed = new EmbedBuilder()
			.setColor('Aqua')
			.addFields({
				name: 'System',
				value: client.util.codeBlock('css', stripIndents`
                Memory Usage : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100} MB
                Guilds       : ${client.guilds.cache.size}
                Users        : ${client.users.cache.size}
                Node         : ${process.version}
                Client       : ${version}
                Uptime       : ${client.util.timeString(process.uptime())}`),
			});

		interaction.reply({ embeds: [embed] });
	}
};
