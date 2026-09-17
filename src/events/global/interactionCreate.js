// Import the base Event class
const Event = require('../../structures/EventClass');

// Import the InteractionType enumeration from discord.js
const { InteractionType, MessageFlags } = require('discord.js');

// Define and export the InteractionCreate class that extends the Event base class
module.exports = class InteractionCreate extends Event {
	// Constructor to initialize the event with its name and category
	constructor(client) {
		super(client, {
			name: 'interactionCreate', // Event name
			category: 'interaction', // Event category
		});
	}

	// Method to handle the interaction event
	async run(interaction) {
		const client = this.client;

		// Ignore interactions from bots
		if (interaction.user.bot) return;

		// Handle slash commands / application commands
		if (interaction.type === InteractionType.ApplicationCommand) {
			// Retrieve the command from the client commands collection
			const command = client.commands.get(interaction.commandName);

			// If the command is not found, send an error message and remove the command from the collection
			if (!command) {
				await interaction.reply({ content: 'This command is unavailable. *Check back later.*', flags: MessageFlags.Ephemeral }).catch(() => null);
				client.commands.delete(interaction.commandName);
				return;
			}

			try {
				// Execute the command
				await command.run(client, interaction);
			}
			catch (e) {
				// Log the error and safely send an error message if the command fails
				console.error(`Command error in ${interaction.commandName}:`, e);
				const errorPayload = { content: `An error has occurred.\n\n**\`${e.message}\`**`, flags: MessageFlags.Ephemeral };

				if (interaction.replied || interaction.deferred) {
					await interaction.followUp(errorPayload).catch(() => null);
				}
				else {
					await interaction.reply(errorPayload).catch(() => null);
				}
			}
		}
	}
};
