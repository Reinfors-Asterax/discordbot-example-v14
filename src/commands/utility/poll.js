const Command = require('../../structures/CommandClass');
const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder, InteractionContextType } = require('discord.js');

module.exports = class Poll extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('poll')
				.setDescription('Create quick polls in Discord')
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
				.addStringOption(option => option
					.setName('question')
					.setDescription('The poll question')
					.setRequired(true),
				)
				.addStringOption(option => option
					.setName('answer1')
					.setDescription('Answer Option 1'),
				)
				.addStringOption(option => option
					.setName('answer2')
					.setDescription('Answer Option 2'),
				)
				.addStringOption(option => option
					.setName('answer3')
					.setDescription('Answer Option 3'),
				)
				.addStringOption(option => option
					.setName('answer4')
					.setDescription('Answer Option 4'),
				),
			usage: '/poll question:<question> answer1:[answer1] answer2:[answer2] answer3:[answer3] answer4:[answer4]',
			category: 'Utility',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		await interaction.deferReply();

		const question = interaction.options.getString('question');

		const answer1 = interaction.options.getString('answer1');
		const answer2 = interaction.options.getString('answer2');
		const answer3 = interaction.options.getString('answer3');
		const answer4 = interaction.options.getString('answer4');

		const totalAnswers = [answer1, answer2, answer3, answer4].filter(answer => answer);
		const reactions = ['🇦', '🇧', '🇨', '🇩'];
		const defReaction = ['👍', '👎'];
		const reactionSubset = reactions.slice(0, totalAnswers.length);

		if (totalAnswers.length === 0) {
			const embed = new EmbedBuilder()
				.setTitle('**Question**')
				.setColor('Random')
				.setDescription(`${question}`)
				.addFields({
					name: '**Choices**',
					value: `
                👍 Yes
                👎 No
                `,
				});
			const defaultReply = await interaction.editReply({ embeds: [embed] });
			for (const reaction of defReaction) {
				await defaultReply.react(reaction);
			}
		}
		else {
			const embed = new EmbedBuilder()
				.setTitle('**Question**')
				.setColor('Random')
				.setDescription(`${question}`)
				.addFields({
					name: '**Choices**',
					value: `
                    ${totalAnswers.map((answer, index) => `${reactionSubset[index]} ${answer}`).join('\n')}
                    `,
				});

			const multipleReply = await interaction.editReply({ embeds: [embed] });
			for (const reactionEmoji of reactionSubset) {
				await multipleReply.react(reactionEmoji);
			}
		}

	}
};
