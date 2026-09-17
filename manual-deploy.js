// This file are used to manually redeploy the slash command if you have made changes like
// Slash command name, description, options, etc...

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
require('dotenv').config();

const deploy = async () => {
	const commandData = [];

	// Read all categories from the commands directory
	fs.readdirSync('./src/commands/').forEach(category => {
		const commands = fs.readdirSync(`./src/commands/${category}/`).filter(cmd => cmd.endsWith('.js'));

		for (const command of commands) {
			const Command = require(`./src/commands/${category}/${command}`);
			const cmd = new Command();
			const cmdData = cmd.data.toJSON();
			commandData.push(cmdData);
		}
	});

	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

	try {
		const clientId = process.env.CLIENTID;

		console.log(`[${new Date().toString().split(' ', 5).join(' ')}] Started refreshing ${commandData.length} Slash Commands and Context Menus...`);

		await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commandData },
		);
		console.log(`[${new Date().toString().split(' ', 5).join(' ')}] Successfully deployed ${commandData.length} Slash Commands and Context Menus globally.`);
	}
	catch (e) {
		console.error(e);
	}
};

deploy();
