const Command = require('../../structures/CommandClass');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, EmbedBuilder, DiscordAPIError, InteractionContextType } = require('discord.js');

module.exports = class AddEmote extends Command {
    constructor(client) {
        super(client, {
            data: new SlashCommandBuilder()
                .setName('emote')
                .setDescription('Add emote to your server using this command!')
                .setContexts(InteractionContextType.Guild)
                .addAttachmentOption(option => option
                    .setName('emote')
                    .setDescription('Image you want to turn into server emote.')
                    .setRequired(true),
                )
                .addStringOption(option => option
                    .setName('name')
                    .setDescription('The name of the emote')
                    .setRequired(true),
                ),
            usage: 'emote <image> <name>',
            category: 'Moderation',
            permissions: ['Use Application Commands', 'Send Messages', 'Embed Links', 'Manage Expression'],
            hidden: false,
        });
    }

    async run(client, interaction) {
        if (!interaction.guild) return;
        await interaction.deferReply();

        const botMember = interaction.guild.members.cache.get(client.user.id) || await interaction.guild.members.fetch(client.user.id);
        if (!botMember.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            return interaction.editReply({
                embeds: [client.embeds.missingPermsEmbed('I need the \'Manage Expressions\' permission to add emotes.', 'Make sure I have the correct permission to do this.')],
            });
        }

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            return interaction.editReply({
                embeds: [client.embeds.missingPermsEmbed('You need \'Manage Expressions\' permission to add emotes.', 'Make sure you have the correct permission to do this.')],
            });
        }

        const upload = interaction.options.getAttachment('emote');
        const name = interaction.options.getString('name');

        try {
            const emoji = await interaction.guild.emojis.create({
                attachment: upload.attachment,
                name: name,
            });

            const embed = new EmbedBuilder()
                .setTitle('Emote Added')
                .setDescription(`Successfully added emote ${emoji} with the name \`${name}\`.`)
                .setColor('Green');

            return await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            let errorMessage = 'An unexpected error occurred. Please try again later.';
            if (error instanceof DiscordAPIError && error.code === 50045) {
                errorMessage = 'The uploaded image exceeds the maximum allowed size of 32 MB. Please upload an image smaller than 32 MB.';
            }
            else if (error.message) {
                errorMessage = error.message;
            }

            const errorEmbed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription(errorMessage)
                .setColor('Red');

            return await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
