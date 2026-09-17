// Import necessary classes from the discord.js library
const { Client, GatewayIntentBits, Partials, Options } = require('discord.js');
// Import the Collection class from the @discordjs/collection package
const { Collection } = require('@discordjs/collection');

// Import custom handlers for commands and events
const CommandHandler = require('../handle/Command');
const EventHandler = require('../handle/Events');

// Define and export the Bot class, which extends the Client class from discord.js
module.exports = class Bot extends Client {
	// Constructor method for initializing the bot instance
	constructor(options = {}) {
		// Call the parent Client constructor with options and intents
		super({
			...options, // Pass additional options
			makeCache: Options.cacheWithLimits({
				MessageManager: 25, // Restrict cached messages per channel (default 200)
				StageInstanceManager: 0,
				VoiceStateManager: 0,
				ThreadManager: 0,
				ThreadMemberManager: 0,
				GuildScheduledEventManager: 0,
				GuildInviteManager: 0,
				AutoModerationRuleManager: 0,
			}),
			sweepers: {
				...Options.DefaultSweeperSettings,
				messages: {
					interval: 3600, // Sweep every hour
					lifetime: 1800, // Remove messages older than 30 mins
				},
				users: {
					interval: 3600,
					filter: () => user => user.id !== user.client.user?.id,
				},
			},
			partials: [
				Partials.GuildMember, // To receive events related to guild members (such as joins or leaves)
				Partials.Message, // To receive partial message data
				Partials.Channel, // To receive partial channel data
				Partials.User, // To receive partial user data
			],
			intents: [
				GatewayIntentBits.Guilds, // Required for general guild (server) events
				GatewayIntentBits.GuildMessages, // Required for receiving message events
				GatewayIntentBits.GuildMessageReactions, // Required for poll/help reaction events
			],
		});

        // Load configuration and utility files
        this.config = require('../util/config.js');
        this.util = require('../util/util.js');
        this.embeds = require('../../src/assets/json/embeds');

        // Initialize Collections to store commands, events, and helps
        this.helps = new Collection();
        this.commands = new Collection();
        this.events = new Collection();

        // Instantiate and build the event and command handlers
        new EventHandler(this).build('../events/global');
        new CommandHandler(this).build('../commands');
    }

    // Method to log in to Discord using the bot token
    async login() {
        await super.login(process.env.TOKEN); // Use the token from environment variables
    }

    // Method to gracefully shut down the bot
    exit() {
        if (this.quitting) return; // Prevent multiple shutdown attempts
        this.quitting = true;
        this.destroy(); // Close the bot connection and clean up resources
    }

    // Method to fetch a command by its name
    fetchCommand(cmd) {
        return this.commands.get(cmd); // Retrieve the command from the commands collection
    }
};
