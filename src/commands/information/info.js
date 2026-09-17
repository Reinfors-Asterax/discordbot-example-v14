const Command = require('../../structures/CommandClass');
const information = require('../../assets/json/information');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, StringSelectMenuBuilder, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = class Info extends Command {
	constructor(client) {
		super(client, {
			data: new SlashCommandBuilder()
				.setName('info')
				.setDescription('See the information')
				.setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
				.addSubcommand(subcommand => subcommand
					.setName('server')
					.setDescription('See information about current server'))
				.addSubcommand(subcommand => subcommand
					.setName('user')
					.setDescription('See information about specific user')
					.addUserOption(option => option
						.setName('user')
						.setDescription('The user you want to check the information')))
				.addSubcommand(subcommand => subcommand
					.setName('role')
					.setDescription('See information about a role')
					.addRoleOption(option => option
						.setName('role')
						.setDescription('The role you want to check')
						.setRequired(true)))
				.addSubcommand(subcommand => subcommand
					.setName('emotelist')
					.setDescription('Show list of the server emote.'))
				.addSubcommand(subcommand => subcommand
					.setName('anime')
					.setDescription('See information about anime')
					.addStringOption(option => option
						.setName('anime')
						.setDescription('The anime information you want to check.')
						.setRequired(true))),
			usage: 'info <subcommand>',
			category: 'Information',
			permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
			hidden: false,
		});
	}

	async run(client, interaction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case 'user': {
				const targetUser = interaction.options.getUser('user') || interaction.user;
				const member = interaction.guild ? (interaction.guild.members.cache.get(targetUser.id) || await interaction.guild.members.fetch(targetUser.id).catch(() => null)) : null;

				const embed = new EmbedBuilder()
					.setColor('Random')
					.setThumbnail(targetUser.displayAvatarURL({ size: 2048 }))
					.setTitle(`${targetUser.username}'s information`)
					.addFields({
						name: '__Basic Account Information__',
						value: `
                • **ID »** ${targetUser.id}
                • **Bot »** ${information.bot[targetUser.bot]}
                • **Account Creation »** <t:${Math.floor(targetUser.createdAt.getTime() / 1000)}:f>
                • **Account Age »** ${Math.floor((Date.now() - targetUser.createdAt.getTime()) / (1000 * 60 * 60 * 24))} Days
                `,
					});

				if (member) {
					embed.addFields({
						name: '__Member Information__',
						value: `
                • **Nickname »** ${member.nickname ? member.nickname : 'No Nickname Set'}
                • **Joined At »** ${member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:f>` : 'Unknown'}
                `,
					});
				}

				return await interaction.reply({ embeds: [embed] });
			}
			case 'server': {
				if (!interaction.guild) {
					return await interaction.reply({ content: 'This subcommand can only be used in a server.', flags: MessageFlags.Ephemeral });
				}

				const owner = await interaction.client.users.fetch(interaction.guild.ownerId).catch(() => null);
				const guildFeatures = interaction.guild.features.map(feature => information.features[feature] || feature).join(', ') || 'None';
				const verificationLevels = information.verify[interaction.guild.verificationLevel] || interaction.guild.verificationLevel;
				const afkTimeout = information.afkTimeout[interaction.guild.afkTimeout] || 'None';

				const embed = new EmbedBuilder()
					.setTitle(`${interaction.guild.name} Information`)
					.setColor('Random')
					.setThumbnail(interaction.guild.iconURL())
					.addFields(
						{
							name: '__Basic Information__',
							value: `
            • **ID »** ${interaction.guild.id}
            • **Created »** <t:${Math.floor(interaction.guild.createdAt.getTime() / 1000)}:f>
            • **Owner »** ${owner ? owner.username : 'Unknown'} [${interaction.guild.ownerId}]
            • **Verification »** ${verificationLevels}
            • **Total Roles »** ${interaction.guild.roles.cache.size}
            `,
						},
						{
							name: '__Members Information__',
							value: `
            • **Users »** ${interaction.guild.memberCount - interaction.guild.members.cache.filter(x => x.user.bot).size}
            • **Bots »** ${interaction.guild.members.cache.filter(n => n.user.bot).size}
            `,
						},
						{
							name: '__Channels Information__',
							value: `
            • **Total Channels »** ${interaction.guild.channels.cache.size}
            • **AFK Channel »** ${interaction.guild.afkChannel ? interaction.guild.afkChannel.name : 'None'}
            • **AFK Timeout »** ${afkTimeout}
            `,
						},
						{
							name: 'Guild Features',
							value: guildFeatures,
						},
					);

				return await interaction.reply({ embeds: [embed] });
			}
			case 'role': {
				const role = interaction.options.getRole('role');
				if (!role) {
					return await interaction.reply({ content: 'Role not found.', flags: MessageFlags.Ephemeral });
				}

				const embed = new EmbedBuilder()
					.setTitle(`Information about role: ${role.name}`)
					.setColor('Random')
					.addFields(
						{
							name: '__Role Information__',
							value: `
                • **Role ID »** ${role.id}
                • **Role Created »** <t:${Math.floor(role.createdTimestamp / 1000)}:f>
                • **Position »** ${role.rawPosition}
                • **Color »** #${role.color.toString(16)}
                • **Hoisted? »** ${role.hoist ? 'Yes' : 'No'}
            `,
						},
						{
							name: `Permissions: [${role.permissions.toArray().length}]`,
							value: role.permissions.toArray().length ? role.permissions.toArray().join(', ') : 'None',
						},
					);

				return await interaction.reply({ embeds: [embed] });
			}
			case 'emotelist': {
				if (!interaction.guild) {
					return await interaction.reply({ content: 'This subcommand can only be used in a server.', flags: MessageFlags.Ephemeral });
				}

				const emojis = interaction.guild.emojis.cache.map(x => `${x}`).join(' ') || 'No emojis available in this server';

				const embed = new EmbedBuilder()
					.setTitle(`Emote list for ${interaction.guild.name}`)
					.setColor('Random')
					.setDescription(emojis.length > 4000 ? emojis.slice(0, 4000) + '...' : emojis);

				return await interaction.reply({ embeds: [embed] });
			}
			case 'anime': {
				await interaction.deferReply();
				const find = interaction.options.getString('anime');

				try {
					const res = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(find.replace(/ ,/g, ' '))}&page[offset]=0`, {
						headers: {
							'Accept': 'application/vnd.api+json',
						},
					});
					const json = await res.json();
					const result = json.data;
					if (!result || !result.length) {
						return await interaction.editReply({ content: 'No anime found matching your search.' });
					}

					const limitedResults = result.slice(0, 10);
					const embed = new EmbedBuilder()
						.setColor('Green')
						.setTitle('Multiple Anime found!')
						.setDescription(`${limitedResults.map((x, i) => `**${i + 1}.** ${x.attributes.canonicalTitle}`).join('\n')}\n\n**Select an anime below or click Cancel.**`);

					const optionsArray = limitedResults.map((x, i) => {
						return {
							label: x.attributes.canonicalTitle.slice(0, 100),
							description: (x.attributes.synopsis ? x.attributes.synopsis.slice(0, 95) : 'No description available') + '...',
							value: `${i}`,
						};
					});

					const selectMenu = new StringSelectMenuBuilder()
						.setCustomId('select_anime')
						.setPlaceholder('Select an anime to view details.')
						.setMinValues(1)
						.setMaxValues(1)
						.addOptions(optionsArray);

					const bStop = new ButtonBuilder()
						.setCustomId('stop_anime')
						.setEmoji('🚫')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Secondary);

					const rowSelectMenu = new ActionRowBuilder().addComponents(selectMenu);
					const rowButton = new ActionRowBuilder().addComponents(bStop);

					const replyMsg = await interaction.editReply({ embeds: [embed], components: [rowSelectMenu, rowButton] });

					const filter = i => (i.customId === 'stop_anime' || i.customId === 'select_anime') && i.user.id === interaction.user.id;
					const collector = replyMsg.createMessageComponentCollector({ filter, time: 30000 });

					collector.on('collect', async i => {
						if (i.customId === 'stop_anime') {
							await i.update({ content: 'Command cancelled.', components: [], embeds: [] });
							collector.stop('user_cancelled');
						}
						else if (i.customId === 'select_anime') {
							const selectedIndex = parseInt(i.values[0]);
							const atts = limitedResults[selectedIndex];
							const animeEmbed = new EmbedBuilder()
								.setTitle(atts.attributes.canonicalTitle)
								.setDescription(atts.attributes.synopsis ? atts.attributes.synopsis.slice(0, 2048) : 'No synopsis available.')
								.setColor('Blue');

							if (atts.attributes.posterImage && atts.attributes.posterImage.original) {
								animeEmbed.setImage(atts.attributes.posterImage.original);
							}
							if (atts.attributes.posterImage && atts.attributes.posterImage.medium) {
								animeEmbed.setThumbnail(atts.attributes.posterImage.medium);
							}
							if (atts.attributes.titles && atts.attributes.titles.en) {
								animeEmbed.addFields({ name: '**__English title__**', value: atts.attributes.titles.en, inline: false });
							}
							if (atts.attributes.titles && atts.attributes.titles.ja_jp) {
								animeEmbed.addFields({ name: '**__Japanese Title__**', value: atts.attributes.titles.ja_jp, inline: false });
							}
							if (atts.attributes.episodeCount) {
								const epText = atts.attributes.episodeLength ? `${atts.attributes.episodeCount} @ ${atts.attributes.episodeLength} mins` : `${atts.attributes.episodeCount}`;
								animeEmbed.addFields({ name: '**__Episodes__**', value: epText, inline: true });
							}
							if (atts.attributes.status) {
								animeEmbed.addFields({ name: '**__Status__**', value: atts.attributes.status, inline: true });
							}
							if (atts.attributes.averageRating) {
								animeEmbed.addFields({ name: '**__Rating__**', value: `${atts.attributes.averageRating}%`, inline: true });
							}

							await i.update({ embeds: [animeEmbed], components: [] });
							collector.stop('selected');
						}
					});

					collector.on('end', async (_, endReason) => {
						if (endReason !== 'user_cancelled' && endReason !== 'selected') {
							await interaction.editReply({ content: 'Command timed out.', components: [], embeds: [] }).catch(() => null);
						}
					});
				}
				catch (e) {
					console.error('Error fetching anime information:', e);
					return await interaction.editReply({ content: `An error occurred while searching: ${e.message}`, components: [], embeds: [] });
				}
				break;
			}
		}
	}
};
