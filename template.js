/* eslint-disable no-unused-vars */

// Command Template
// This template is designed to help you create new commands for your Discord bot.
// To use this template:
// 1. Copy this file and rename it to match your command's purpose (e.g., `PingCommand.js`).
// 2. Update the following sections as necessary:

// - **Command Name**: Set the command's name using the `.setName()` method.
// - **Command Description**: Provide a brief description of what the command does with `.setDescription()`.
// - **Contexts**: Use `.setContexts(...)` with `InteractionContextType` to configure where the command can be used (e.g. Guild, BotDM, PrivateChannel).
// - **Usage Information**: Specify how to use the command in the `usage` property (e.g., `ping`).
// - **Command Category**: Indicate the category this command belongs to (e.g., `Utility`, `Moderation`).
// - **Permissions Required**: Define which permissions are needed to use this command in the `permissions` array.
// - **Hidden Status**: Set `hidden` to true if you want to hide the command from help listings.

// Finally, implement the command logic inside the `run` method.
// This method will be executed when the command is invoked by a user.

const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { InteractionContextType } = require('discord.js');

module.exports = class Example extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('') // Set the command name here
				.setDescription('') // Set the command description here
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel), // Specify allowed contexts
			usage: '', // Usage format for the command
			category: '', // Category of the command
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'], // Required permissions
			hidden: false, // Whether to hide the command from help listings
		});
	}

	async run(client, interaction) {
		// Implement your command logic here.
		// For example, send a response message using: await interaction.reply('Hello!');
	}
};

// Event Template
// This template is designed to help you create new event handlers for your Discord bot.
// To use this template:
// 1. Copy this file and rename it to match the event you want to handle (e.g., `GuildMemberAdd.js`).
// 2. Update the following sections as necessary:

// - **Event Name**: Set the name of the event in the constructor (e.g., 'guildMemberAdd').
// - **Event Category**: Specify the category of the event for better organization (e.g., 'guild', 'interaction').

// Finally, implement the event handling logic inside the `run` method.
// This method will be executed when the specified event occurs.

const Event = require('../../structures/EventClass');

module.exports = class Example extends Event {
	constructor(client) {
		super(client, {
			name: '', // Set the event name here
			category: '', // Specify the category of the event
		});
	}

	async run() {
		// Implement your event handling logic here.
		// For example: console.log('An example event has occurred!');
	}
};

// Context Menu Template (User or Message)
// This template is designed to help you create context menu commands (Right-Click > Apps).
// To use this template:
// 1. Set .setType(ApplicationCommandType.User) for user context menus, OR
//    Set .setType(ApplicationCommandType.Message) for message context menus.
// 2. In run(), access interaction.targetUser (for User menus) or interaction.targetMessage (for Message menus).

const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = class ExampleContextMenu extends Command {
	constructor(client) {
		super(client, {
			data: new ContextMenuCommandBuilder()
				.setName('Example Context Menu') // Name shown in Right-Click > Apps menu
				.setType(ApplicationCommandType.User) // ApplicationCommandType.User or ApplicationCommandType.Message
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
			contextDescription: 'Description of what this context menu does',
			usage: 'Right-Click User > Apps > Example Context Menu',
			category: 'Context',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		// For User menus: interaction.targetUser and interaction.targetMember
		// For Message menus: interaction.targetMessage
		await interaction.reply({ content: `Interacted with ${interaction.targetUser ? interaction.targetUser.username : interaction.targetMessage?.id}` });
	}
};
