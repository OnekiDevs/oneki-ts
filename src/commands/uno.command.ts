import { ButtonInteraction, ChatInputCommandInteraction, Message } from 'discord.js'
import { Command, UnoGame, Player } from '../utils/classes.js'
import { sendError, Translator } from '../utils/utils.js'
import { getAllCards } from '../classes/UnoCards.js'
import client from '../client.js'

export default class SS extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'uno',
                'es-ES': 'uno'
            },
            description: {
                'en-US': 'Generates a UNO game',
                'es-ES': 'Genera un juego de UNO'
            }
        })
    }

    // @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
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

    async message(message: Message<true>, args: string[]): Promise<any> {
        try {
            const cards = await getAllCards()
            new UnoGame(message, cards)
        } catch (error) {
            message.reply('Ha ocurrido un error, reporte genrado')
            sendError(error as Error, import.meta.url)
        }
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        const [, id, option] = interaction.customId.split(/_/gi)

        const uno = client.uno.get(id)
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
}
