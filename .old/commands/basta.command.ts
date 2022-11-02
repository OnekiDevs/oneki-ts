import { ChatInputCommandInteraction, ButtonInteraction, EmbedBuilder, ButtonStyle, Collection } from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'
import { ActionRowBuilder, ButtonBuilder, MessageActionRowComponentBuilder } from '@discordjs/builders'
import BastaGame from '../classes/BastaGame.js'

export default class Hangman extends Command {
    games = new Collection<string, BastaGame>()
    tempGames = new Collection<string, Set<string>>()
    dontGameRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
        new ButtonBuilder().setCustomId('basta_create').setLabel('Create game').setStyle(ButtonStyle.Primary)
    )
    JoinRow = (id: string) =>
        new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
            new ButtonBuilder()
                .setCustomId('basta_join_' + id)
                .setLabel('Join game')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('basta_start').setLabel('Start game').setStyle(ButtonStyle.Primary)
        )
    embedGame = (params: { hostId: string; hostIconUrl: string; hostname: string; players: string[] }) =>
        new EmbedBuilder()
            .setTitle('Basta')
            .setDescription(`<@${params.hostId}> have created a game\nClick in join to join in game`)
            .setAuthor({
                name: params.hostname,
                iconURL: params.hostIconUrl
            })
            .addFields({
                name: 'Players',
                value: `<@${params.hostId}>`
            })
    constructor() {
        super({
            name: {
                'en-US': 'basta',
                'es-ES': 'basta'
            },
            description: {
                'en-US': 'Play basta',
                'es-ES': 'Juega a basta'
            },
            global: false
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        if (!this.tempGames.find(v => v.has(interaction.user.id)))
            return interaction.reply({
                content: 'you dont have in a game',
                components: [this.dontGameRow],
                ephemeral: true
            })
        else {
            const game = this.games.find(v => v.players.has(interaction.user.id))
            if (!game)
                return interaction.reply({
                    content: 'this game is not available',
                    ephemeral: true
                })
            return interaction.reply({
                content: 'you have joined in game',
                ephemeral: true
            })
        }
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const [, opt, id] = interaction.customId.split('_')
        if (opt === 'join') {
            const game = this.tempGames.get(id)
            if (!game) return interaction.reply({ content: 'this game is not available', ephemeral: true })
            game.add(interaction.user.id)
            interaction.reply({
                content: 'you have joined in game',
                ephemeral: true
            })
            const embed = EmbedBuilder.from(interaction.message.embeds[0].data).setFields({
                name: 'Players',
                value: [...game].map(v => `<@${v}>`).join(' ')
            })
            return interaction.message.edit({
                embeds: [embed]
            })
        } else if (opt === 'create') {
            const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            interaction.reply({
                embeds: [
                    this.embedGame({
                        hostname: interaction.user.username,
                        hostIconUrl: interaction.user.avatarURL() ?? '',
                        hostId: interaction.user.id,
                        players: [interaction.user.id]
                    })
                ],
                components: [this.JoinRow(id)]
            })
            this.tempGames.set(id, new Set([interaction.user.id]))
        } else {
            const userId = interaction.message.embeds[0].description
                ?.split(/\ +/g)[0]
                .replace('<@', '')
                .replace('>', '')
            if (userId !== interaction.user.id)
                return interaction.reply({ content: 'you are not the host', ephemeral: true })
            const game = this.tempGames.get(id)
            if (!game) return interaction.reply({ content: 'this game is not available', ephemeral: true })
            const g = this.games.set(id, new BastaGame(interaction.message)).get(id) as BastaGame
            return g.start()
        }
    }
}
