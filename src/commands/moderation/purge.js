const Command = require('../../structures/CommandClass');

const { PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Purge extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('purge')
				.setDescription('Remove up to 100 messages in the channel')
				.setContexts(InteractionContextType.Guild)
				.addIntegerOption(option => option
					.setName('number')
					.setDescription('total messages you want to purge')
					.setRequired(true),
				)
				.addUserOption(option => option
					.setName('user')
					.setDescription('User you want to delete their messages')
					.setRequired(false),
				),
			usage: 'purge <number> [@user]',
			category: 'Moderation',
			permissions: ['Manage Messages', 'User Manage Messages'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		if (!interaction.guild) return;

		const botMember = interaction.guild.members.cache.get(client.user.id) || await interaction.guild.members.fetch(client.user.id);
		if (!botMember.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I need the \'manage messages\' permission to purge messages.', 'Make sure I have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('You need \'manage messages\' permission to purge messages.', 'Make sure you have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}

		const amount = interaction.options.getInteger('number');
		const targetUser = interaction.options.getUser('user');

		if (!amount || amount <= 0 || amount > 100) {
			return interaction.reply({ embeds: [client.embeds.errorEmbed('Invalid number of messages', 'Please provide a number between 1 and 100 for the messages to be deleted.')], flags: MessageFlags.Ephemeral });
		}

		try {
			const messages = await interaction.channel.messages.fetch({ limit: amount });
			const filteredMessages = targetUser ? messages.filter(message => message.author.id === targetUser.id) : messages;

			await interaction.channel.bulkDelete(filteredMessages, true);

			const successMessage = targetUser
				? `\`${targetUser.tag}\`'s \`${filteredMessages.size}\` messages have been deleted from the current channel!`
				: `\`${filteredMessages.size}\` messages have been deleted from the current channel!`;

			await interaction.reply({ embeds: [client.embeds.successEmbed('Command execution successful', successMessage)], flags: MessageFlags.Ephemeral });
		}
		catch (error) {
			console.error('Error in purge command:', error);
			const errorEmbed = client.embeds.errorEmbed('Deleting messages failed', error.message);
			if (interaction.replied || interaction.deferred) {
				return await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
			}
			return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
		}
	}
};