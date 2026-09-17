const Command = require('../../structures/CommandClass');

const { EmbedBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Help extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('help')
				.setDescription('Returns command information.')
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
				.addStringOption(option => option
					.setName('command')
					.setDescription('The command you want to get help.')
					.setRequired(false),
				),
			usage: 'help [command]',
			category: 'Information',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const commandName = interaction.options.getString('command');

		if (commandName) {
			const command = client.commands.get(commandName);

			if (command) {
				const embed = new EmbedBuilder()
					.setTitle(`${client.user.username} - Command Info`)
					.setColor('Random')
					.setDescription(`
					**Command Name:** ${command.name}
					**Description:**
					> ${command.contextDescription ? command.contextDescription : command.description}

					**Usage:** ${command.contextDescription ? 'Right-Click > Apps > ' : '/'}${command.usage}
					**Category:** ${command.category}
					**Permissions Needed:** ${command.permissions && command.permissions[0] ? `${command.permissions.join(', ')}` : 'None'}
					`);
				return await interaction.reply({ embeds: [embed] });
			}
			return await interaction.reply({ content: 'Command not found.', flags: MessageFlags.Ephemeral });
		}

		const embed = new EmbedBuilder()
			.setTitle(`${client.user.username} Commands`)
			.setThumbnail(client.user.displayAvatarURL({ size: 2048 }))
			.setColor('Random')
			.setDescription('To get specific command from categories, run `/help <command>`\n**`<>` required** and **`[]` optional**');

		client.helps.forEach((commandsArray, category) => {
			const visibleCommands = [];
			commandsArray.forEach(command => {
				if (!command.hidden) {
					visibleCommands.push(`\`${command.name}\``);
				}
			});

			if (visibleCommands.length > 0) {
				embed.addFields({ name: category, value: visibleCommands.join(' '), inline: false });
			}
		});

		await interaction.reply({ embeds: [embed] });
	}
};
