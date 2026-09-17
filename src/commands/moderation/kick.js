const Command = require('../../structures/CommandClass');

const { EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Kick extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('kick')
				.setDescription('Kicks a member from the server')
				.setContexts(InteractionContextType.Guild)
				.addUserOption(option => option
					.setName('user')
					.setDescription('The user you want to kick')
					.setRequired(true),
				)
				.addStringOption(option => option
					.setName('reason')
					.setDescription('The reason you want to kick')
					.setRequired(false),
				)
				.addBooleanOption(option => option
					.setName('hidden')
					.setDescription('Silent kick?')
					.setRequired(false),
				),
			usage: 'kick <@user> [reason] [hidden > true/false]',
			category: 'Moderation',
			permissions: ['Send Messages', 'Kick Members', 'User Kick Members'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		if (!interaction.guild) return;

		const botMember = interaction.guild.members.cache.get(client.user.id) || await interaction.guild.members.fetch(client.user.id);
		if (!botMember.permissions.has(PermissionsBitField.Flags.KickMembers)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I need the \'Kick Members\' permission to kick members.', 'Make sure I have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('You need \'Kick Members\' permission to kick members.', 'Make sure you have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}

		const user = interaction.options.getUser('user');
		if (user.id === interaction.user.id) {
			return interaction.reply({ embeds: [client.embeds.wrongUsageEmbed('You cannot kick yourself.', 'Please mention user you want to kick')], flags: MessageFlags.Ephemeral });
		}
		if (user.id === client.user.id) {
			return interaction.reply({ embeds: [client.embeds.wrongUsageEmbed('what why?', 'Please mention another user other than me...')], flags: MessageFlags.Ephemeral });
		}

		const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);
		if (!member) {
			return interaction.reply({ embeds: [client.embeds.errorEmbed('Member Not Found', 'Could not find that member in this server.')], flags: MessageFlags.Ephemeral });
		}

		if (!member.kickable) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I cannot kick that user, do I have the right permissions or their role is higher than mine?', 'Make sure I have the correct permissions to do this.')], flags: MessageFlags.Ephemeral });
		}

		const reason = interaction.options.getString('reason') || 'No reason specified';
		const silentMode = interaction.options.getBoolean('hidden') || false;

		const serverEmbed = new EmbedBuilder()
			.setTitle('Server kick')
			.setColor('Red')
			.setThumbnail(member.user.displayAvatarURL({ size: 2048 }))
			.setDescription(`
              **Offender »** ${member.user.tag} (${member.user.id})
              **Reason »** ${reason}

              **Server »** ${interaction.guild.name}
              **Moderator »** ${interaction.user.username}
          `);

		try {
			await user.send({ embeds: [serverEmbed] });
		}
		catch (error) {
			console.warn(`Could not DM user ${user.tag} before kicking: ${error.message}`);
		}

		try {
			await member.kick(reason);
			const embed = new EmbedBuilder()
				.setTitle('Server kick')
				.setColor('Red')
				.setThumbnail(member.user.displayAvatarURL({ size: 2048 }))
				.setDescription(`
                **Offender »** ${member.user.tag} (${member.user.id})
                **Reason »** ${reason}
                **Moderator »** ${interaction.user.tag}
            `);
			return await interaction.reply({ embeds: [embed], ...(silentMode ? { flags: MessageFlags.Ephemeral } : {}) });
		}
		catch (error) {
			console.error(`Failed to kick member: ${error}`);
			return await interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I cannot kick that user, do I have the right permissions or their role is higher than mine?', 'Make sure I have the correct permissions to do this.')], flags: MessageFlags.Ephemeral });
		}
	}
};