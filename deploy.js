// Import necessary modules
const { REST } = require('@discordjs/rest'); // REST client for interacting with Discord's API
const { Routes } = require('discord-api-types/v10'); // Routes for the Discord API v10
const fs = require('fs'); // File system module for reading files
require('dotenv').config(); // Load environment variables from a .env file

// Define the deploy function
const deploy = async () => {
    const commandData = []; // Array to hold the data for commands

    // Read all categories from the commands directory
    fs.readdirSync('./src/commands/').forEach(category => {
        // Read all command files within each category
        const commands = fs.readdirSync(`./src/commands/${category}/`).filter(cmd => cmd.endsWith('.js'));

        for (const command of commands) {
            // Dynamically require the command file and instantiate the command class
            const Command = require(`./src/commands/${category}/${command}`);
            const cmd = new Command();
            const cmdData = cmd.data.toJSON(); // Convert command data to JSON format
            commandData.push(cmdData); // Add command data to the commandData array
        }
    });

    // Create a new REST client instance with the Discord API version and token
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        const clientId = process.env.CLIENTID; // Get the client ID from environment variables

        console.log(`[${new Date().toString().split(' ', 5).join(' ')}] Started refreshing ${commandData.length} Slash Commands and Context Menus...`);

        // Deploy the command data to Discord
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commandData },
        );
        console.log(`[${new Date().toString().split(' ', 5).join(' ')}] Successfully deployed ${commandData.length} Slash Commands and Context Menus globally.`);
    }
    catch (e) {
        // Log any errors that occur during deployment
        console.error(e);
    }
};

// Execute the deploy function
deploy();

// Require the main bot file to start the bot
require('./index');
