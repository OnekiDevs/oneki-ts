import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Collection } from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'
import { ActionRowBuilder, ButtonBuilder, MessageActionRowComponentBuilder } from '@discordjs/builders'

export default class Hangman extends Command {
    games = new Collection<string, { players: string[] }>()
    dontGameRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
        new ButtonBuilder().setCustomId('basta_join').setLabel('Join in game').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('basta_create').setLabel('Create game').setStyle(ButtonStyle.Primary)
    )
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
        if (!this.games.filter(v => v.players.includes(interaction.user.id))) return this.sendNew(interaction)
    }

    sendNew(interaction: ChatInputCommandInteraction<'cached'>) {
        interaction.reply({
            content: 'you dont have in a game',
            components: [this.dontGameRow]
        })
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const [, opt] = interaction.customId.split('_')
        if (opt === 'join') {
            interaction.reply({
                ephemeral: true,
                content: 'in work...'
            })
        } else {
            interaction.reply({
                content: 'Click join to join'
            })
        }
        return
    }
}
