import { ButtonInteraction } from 'discord.js'
import { Component, Client } from '../utils/classes.js'
import { Player } from '../classes/Player.js'
import { Translator } from '../utils/utils.js'

export default class Uno extends Component {
    constructor(client: Client) {
        super(client, /uno_.{8}_.{2}(_.{2})?$/i)
    }

    async button(interaction: ButtonInteraction<'cached'>) {
        const translate = Translator(interaction)
        const [, id, option] = interaction.customId.split(/_/gi)

        const uno = this.client.uno.get(id)
        if (!uno) return interaction.deferUpdate()

        if (option === 'jn') {
            if (!uno.players.has(interaction.user.id))
                uno.emit('join', new Player(interaction.user.id))
            interaction.deferUpdate()
        } else if (option === 'st') {
            if (interaction.user.id === uno.host.id) {
                interaction.deferUpdate()
                uno.emit('start')
            } else if (uno.players.has(interaction.user.id)) {
                interaction.reply({
                    content: translate('uno_btn.start_no_host'),
                    ephemeral: true,
                })
            } else
                interaction.reply({
                    content: translate('uno_btn.start_out'),
                    ephemeral: true,
                })
        } else if (option === 'mc') {
            if (uno.players.has(interaction.user.id)) {
                uno.players
                    .get(interaction.user.id)
                    ?.setInteraction(interaction)
                await interaction.deferReply({ ephemeral: true })
                uno.emit('showCards', uno.players.get(interaction.user.id))
            } else interaction.deferUpdate()
        } else if (option === 'ea') {
            if (uno.players.has(interaction.user.id)) {
                await interaction.deferUpdate()
                uno.emit('eat', uno.players.get(interaction.user.id))
            } else interaction.deferUpdate()
        } else {
            const player = uno.players.get(interaction.user.id)
            uno.emit(
                'play',
                player,
                player?.cards.find((c) => c.id == option),
                interaction
            )
        }
        return
    }
}
