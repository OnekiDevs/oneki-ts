import { ChatInputCommandInteraction, Message, ButtonInteraction } from 'discord.js'
import { sendError, Translator } from '../utils/utils.js'
import { getAllCards } from '../classes/UnoCards.js'
import { UnoGame } from '../classes/UnoGame.js'
import { Player } from '../classes/Player.js'
import _uno from '../cache/uno.js'

/**
 * message
 * const cards = await getAllCards()
 * new UnoGame(message, cards)
 */

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
    try {
        const message = (await interaction.channel?.send('Generando juego...')) as Message<true>
        interaction.reply({
            content: 'Generando juego...',
            ephemeral: true
        })
        const cards = await getAllCards()
        new UnoGame(message, cards)
    } catch (error) {
        interaction.reply('Ha ocurrido un error, reporte genrado')
        sendError(error as Error, import.meta.url)
    }
}

export async function buttonInteraction(interaction: ButtonInteraction<'cached'>): Promise<any> {
    const translate = Translator(interaction)
    const [, id, option] = interaction.customId.split(/_/gi)

    const uno = _uno.get(id)
    if (!uno) return interaction.deferUpdate()

    if (option === 'jn') {
        const cards = await getAllCards()
        if (!uno.players.has(interaction.user.id)) uno.emit('join', new Player(interaction.user.id, cards))
        interaction.deferUpdate()
    } else if (option === 'st') {
        if (interaction.user.id === uno.host.id) {
            interaction.deferUpdate()
            uno.emit('start', interaction)
        } else if (uno.players.has(interaction.user.id)) {
            interaction.reply({
                content: translate('uno_cmd.start_no_host'),
                ephemeral: true
            })
        } else
            interaction.reply({
                content: translate('uno_cmd.start_out'),
                ephemeral: true
            })
    } else if (option === 'mc') {
        if (uno.players.has(interaction.user.id)) {
            uno.players.get(interaction.user.id)?.setInteraction(interaction)
            await interaction.deferReply({ ephemeral: true })
            uno.emit('showCards', uno.players.get(interaction.user.id), interaction)
        } else interaction.deferUpdate()
    } else if (option === 'ea') {
        if (uno.players.has(interaction.user.id)) {
            await interaction.deferUpdate()
            uno.emit('eat', uno.players.get(interaction.user.id), interaction)
        } else interaction.deferUpdate()
    } else if (option === 'nw') {
        if (interaction.user.id === uno.host.id) {
            interaction.deferUpdate()
            uno.emit('new', interaction)
        } else if (uno.players.has(interaction.user.id)) {
            interaction.reply({
                content: translate('uno_cmd.start_no_host'),
                ephemeral: true
            })
        } else
            interaction.reply({
                content: translate('uno_cmd.start_out'),
                ephemeral: true
            })
    } else {
        const player = uno.players.get(interaction.user.id)
        uno.emit(
            'play',
            player,
            player?.cards.find(c => c.id == option),
            interaction
        )
    }
    return
}
