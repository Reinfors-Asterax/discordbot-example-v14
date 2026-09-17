const Command = require('../../structures/CommandClass');
const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, InteractionContextType } = require('discord.js');

module.exports = class UserAvatar extends Command {
	constructor(client) {
		super(client, {
			data: new ContextMenuCommandBuilder()
				.setName('Get Avatar')
				.setType(ApplicationCommandType.User)
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
			contextDescription: 'Right-click a user to view their avatar',
			usage: 'Get Avatar',
			category: 'Context',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const targetUser = interaction.targetUser;

		const embed = new EmbedBuilder()
			.setTitle(`${targetUser.username}'s Avatar`)
			.setImage(targetUser.displayAvatarURL({ size: 2048 }))
			.setColor('Random');

		await interaction.reply({ embeds: [embed] });
	}
};

