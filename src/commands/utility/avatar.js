const Command = require('../../structures/CommandClass');
const { EmbedBuilder, InteractionContextType } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Avatar extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('avatar')
				.setDescription('Show your or others avatar')
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
				.addUserOption(option => option.setName('user')
					.setDescription('The user you want to view its avatar')
					.setRequired(false)),
			usage: 'avatar [@user]',
			category: 'Utility',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const user = interaction.options.getUser('user') || interaction.user;
		const embed = new EmbedBuilder()
			.setTitle(`${user.tag} Avatar`)
			.setImage(user.displayAvatarURL({ size: 2048 }))
			.setColor('Random');

		await interaction.reply({ embeds: [embed] });
	}
};
