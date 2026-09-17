const Command = require('../../structures/CommandClass');

const { EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Ban extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('ban')
				.setDescription('Ban a member from the server.')
				.setContexts(InteractionContextType.Guild)
				.addUserOption(option => option
					.setName('user')
					.setDescription('The user you want to ban')
					.setRequired(true))
				.addStringOption(option => option
					.setName('reason')
					.setDescription('The reason you want to ban')
					.setRequired(false))
				.addBooleanOption(option => option
					.setName('hidden')
					.setDescription('Whether the ban announcement should be hidden')
					.setRequired(false)),
			usage: 'ban <@user> [reason] [hidden]',
			category: 'Moderation',
			permissions: ['Ban Members', 'User Ban Members'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		if (!interaction.guild) return;

		const botMember = interaction.guild.members.cache.get(client.user.id) || await interaction.guild.members.fetch(client.user.id);
		if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I need the \'Ban Members\' permission to ban members.', 'Make sure I have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('You need \'Ban Members\' permission to ban members.', 'Make sure you have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}

		const user = interaction.options.getUser('user');
		if (user.id === interaction.user.id) {
			return interaction.reply({ embeds: [client.embeds.wrongUsageEmbed('You cannot ban yourself.', 'Please mention user you want to ban')], flags: MessageFlags.Ephemeral });
		}
		if (user.id === client.user.id) {
			return interaction.reply({ embeds: [client.embeds.wrongUsageEmbed('what why?', 'Please mention another user other than me...')], flags: MessageFlags.Ephemeral });
		}

		const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);
		if (!member) {
			return interaction.reply({ embeds: [client.embeds.errorEmbed('Member Not Found', 'Could not find that member in this server.')], flags: MessageFlags.Ephemeral });
		}

		if (!member.bannable) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I cannot ban that user, do I have the right permissions or their role is higher than mine?', 'Make sure I have the correct permissions to do this.')], flags: MessageFlags.Ephemeral });
		}

		const reason = interaction.options.getString('reason') || 'No reason specified';
		const silentMode = interaction.options.getBoolean('hidden') || false;

		const serverEmbed = new EmbedBuilder()
			.setTitle('Server ban')
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
			console.warn(`Could not DM user ${user.tag} before banning: ${error.message}`);
		}

		try {
			await member.ban({ deleteMessageSeconds: 7 * 24 * 60 * 60, reason });
			const embed = new EmbedBuilder()
				.setTitle('Server ban')
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
			console.error(`Failed to ban member: ${error}`);
			return await interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I cannot ban that user, do I have the right permissions or their role is higher than mine?', 'Make sure I have the correct permissions to do this.')], flags: MessageFlags.Ephemeral });
		}
	}
};