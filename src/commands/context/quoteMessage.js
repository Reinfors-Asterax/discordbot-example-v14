const Command = require('../../structures/CommandClass');
const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = class QuoteMessage extends Command {
	constructor(client) {
		super(client, {
			data: new ContextMenuCommandBuilder()
				.setName('Quote Message')
				.setType(ApplicationCommandType.Message)
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
			contextDescription: 'Right-click a message to quote it in the channel',
			usage: 'Quote Message',
			category: 'Context',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const targetMessage = interaction.targetMessage;

		if (!targetMessage.content && targetMessage.attachments.size === 0) {
			return await interaction.reply({
				content: 'Cannot quote a message with no text or attachments.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: targetMessage.author.username,
				iconURL: targetMessage.author.displayAvatarURL({ size: 256 }),
			})
			.setDescription(targetMessage.content || '*[Message has no text content]*')
			.setColor('Random')
			.setTimestamp(targetMessage.createdAt)
			.setFooter({ text: `Quoted by ${interaction.user.username}` });

		const firstAttachment = targetMessage.attachments.first();
		if (firstAttachment && firstAttachment.contentType && firstAttachment.contentType.startsWith('image/')) {
			embed.setImage(firstAttachment.url);
		}

		await interaction.reply({ embeds: [embed] });
	}
};
