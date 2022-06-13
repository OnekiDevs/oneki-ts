import { ButtonInteraction, ChatInputCommandInteraction, Message } from 'discord.js'
import { Command, Client, UnoGame, Player } from '../utils/classes.js'
import { sendError, Translator } from '../utils/utils.js'

export default class SS extends Command {
    constructor(client: Client) {
        super(client, {
            name: {
                'en-US': 'uno',
                'es-ES': 'uno'
            },
            description: {
                'en-US': 'Generates a UNO game',
                'es-ES': 'Genera un juego de UNO'
            },
            buttonRegex: /^uno_.{8}_.{2}(_.{2})?$/i
        })
    }

    async interacion(interaction: ChatInputCommandInteraction<'cached'>) {
        try {
            const message = (await interaction.channel?.send('Generando juego...')) as Message<true>
            new UnoGame(message, this.client)
            interaction.reply({
                content: 'Juego generado',
                ephemeral: true
            })
        } catch (error) {
            interaction.reply('Ha ocurrido un error, reporte genrado')
            sendError(this.client, error as Error, import.meta.url)
        }
    }

    async message(message: Message<true>, args: string[]): Promise<any> {
        try {
            new UnoGame(message, this.client)
        } catch (error) {
            message.reply('Ha ocurrido un error, reporte genrado')
            sendError(this.client, error as Error, import.meta.url)
        }
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const translate = Translator(interaction)
        const [, id, option] = interaction.customId.split(/_/gi)

        const uno = this.client.uno.get(id)
        if (!uno) return interaction.deferUpdate()

        if (option === 'jn') {
            if (!uno.players.has(interaction.user.id)) uno.emit('join', new Player(interaction.user.id, this.client))
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
