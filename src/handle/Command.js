// Import the BaseCommand class to ensure that commands extend it
const BaseCommand = require('../structures/CommandClass');
// Import path module to handle file and directory paths
const path = require('path');
// Import readdir and lstat functions from fs.promises for file system operations
const { readdir, lstat } = require('fs').promises;
// Import the Discord.js library
const Discord = require('discord.js');

// Define and export the CommandClass
module.exports = class CommandClass {
    // Constructor method to initialize the CommandClass instance
    constructor(client) {
        // Store the client instance which represents the Discord bot
        this.client = client;
    }

    // Asynchronous method to build commands from files in the specified directory
    async build(dir) {
        // Create the full path to the directory containing command files
        const filePath = path.join(__dirname, dir);
        // Read the contents of the directory
        const files = await readdir(filePath);

        // Iterate over each file in the directory
        for (const file of files) {
            // Get the full path to the file
            const fullPath = path.join(filePath, file);
            // Get file statistics (e.g., whether it's a directory)
            const stat = await lstat(fullPath);

            // If the file is a directory, recursively build commands from it
            if (stat.isDirectory()) {
                await this.build(path.join(dir, file));
            }
            // If the file is a JavaScript file, process it as a command
            if (file.endsWith('.js')) {
                // Dynamically import the command file
                const Command = require(fullPath);

                // Check if the imported class extends the BaseCommand class
                if (Command.prototype instanceof BaseCommand) {
                    // Create a new instance of the command class
                    const cmd = new Command(this.client);

                    // Convert the command data to a JSON object
                    const cmdData = cmd.data.toJSON();

                    // Create a command object with necessary properties
                    const cmdSet = {
                        name: cmdData.name, // The name of the command
                        description: cmdData.description, // Description of the command
                        options: cmdData.options, // Command options (parameters)
                        defaultPermission: cmdData.default_permission, // Default permission for the command
                        contextDescription: cmd.contextDescription, // Context menu description (if applicable)
                        usage: cmd.usage, // How the command should be used
                        category: cmd.category, // Category under which the command is grouped
                        permissions: cmd.permissions, // Permissions required to use the command
                        hidden: cmd.hidden || false, // Whether the command should be hidden from help lists
                        run: cmd.run, // The run method to execute the command
                    };

                    // Add the command to the client's commands collection
                    this.client.commands.set(cmdSet.name, cmdSet);

                    // Check if the category exists in the helps collection; if not, create a new collection for it
                    if (!this.client.helps.has(cmdSet.category)) {
                        this.client.helps.set(cmdSet.category, new Discord.Collection());
                    }
                    // Add the command to the appropriate category in the helps collection
                    this.client.helps.get(cmdSet.category).set(cmdSet.name, cmdSet);
                }
            }
        }
    }
};
