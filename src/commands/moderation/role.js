const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder, PermissionsBitField, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = class Role extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('role')
				.setDescription('Add / Remove role from specified user')
				.setContexts(InteractionContextType.Guild)
				.addSubcommand(subcommand => subcommand
					.setName('add')
					.setDescription('Add role from specified user')
					.addUserOption(option => option
						.setName('user')
						.setDescription('User you want to add the role')
						.setRequired(true),
					)
					.addRoleOption(option => option
						.setName('role')
						.setDescription('The role you want to add to the user')
						.setRequired(true),
					)
					.addBooleanOption(option => option
						.setName('ephemeral')
						.setDescription('Make the response to be visible only to the user who issued the command'),
					),
				)
				.addSubcommand(subcommand => subcommand
					.setName('remove')
					.setDescription('Remove role from specified user')
					.addUserOption(option => option
						.setName('user')
						.setDescription('User you want to remove the role')
						.setRequired(true),
					)
					.addRoleOption(option => option
						.setName('role')
						.setDescription('The role you want to remove')
						.setRequired(true),
					)
					.addBooleanOption(option => option
						.setName('ephemeral')
						.setDescription('Make the response to be visible only to the user who issued the command'),
					),
				),
			usage: '/role add/remove user:@user role:@role',
			category: 'Moderation',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links', 'Manage Roles'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		if (!interaction.guild) return;

		const botMember = interaction.guild.members.cache.get(client.user.id) || await interaction.guild.members.fetch(client.user.id);
		if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('I need the \'Manage Roles\' permission to manage members roles.', 'Make sure I have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
			return interaction.reply({ embeds: [client.embeds.missingPermsEmbed('You need \'Manage Roles\' permission to manage members roles.', 'Make sure you have the correct permission to do this.')], flags: MessageFlags.Ephemeral });
		}

		const subcommand = interaction.options.getSubcommand();
		const user = interaction.options.getUser('user');
		const role = interaction.options.getRole('role');
		const ephemeral = interaction.options.getBoolean('ephemeral') || false;

		const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);
		if (!member) {
			return interaction.reply({ embeds: [client.embeds.errorEmbed('Member Not Found', 'Could not find that user in this server.')], flags: MessageFlags.Ephemeral });
		}

		switch (subcommand) {
			case 'add': {
				if (!member.manageable) {
					return interaction.reply({ embeds: [client.embeds.errorEmbed('Failed to add role', `I cannot add ${role} role to **${user.username}** because it's higher or equal in position to my highest role.`)] });
				}

				if (member.roles.cache.has(role.id)) {
					return interaction.reply({ embeds: [client.embeds.errorEmbed('Failed to add role', `${user.username} already has the role ${role}`)] });
				}

				await member.roles.add(role);

				const embed = new EmbedBuilder()
					.setTitle('Role Added')
					.setColor('Green')
					.setDescription(`${role} has been added to **${user.username}**`)
					.setTimestamp();

				await interaction.reply({ embeds: [embed], ...(ephemeral ? { flags: MessageFlags.Ephemeral } : {}) });
				break;
			}
			case 'remove': {
				if (!member.manageable) {
					return interaction.reply({ embeds: [client.embeds.errorEmbed('Failed to remove role', `I cannot remove ${role} role from **${user.username}** because it's higher or equal in position to my highest role.`)] });
				}

				if (!member.roles.cache.has(role.id)) {
					return interaction.reply({ embeds: [client.embeds.errorEmbed('Failed to remove role', `${user.username} doesn't have the role ${role}`)] });
				}

				await member.roles.remove(role);

				const embed = new EmbedBuilder()
					.setTitle('Role Removed')
					.setColor('Green')
					.setDescription(`${role} has been removed from **${user.username}**`)
					.setTimestamp();

				await interaction.reply({ embeds: [embed], ...(ephemeral ? { flags: MessageFlags.Ephemeral } : {}) });
				break;
			}
		}
	}
};
