import { ButtonInteraction } from 'discord.js'
import { Button, Client } from '../utils/classes'
import { Player } from '../classes/Player'

export default class Uno extends Button {
    constructor() {
        super({
            name: 'uno_',
            regex: /uno_.{8}_.{2}(_.{2})?$/gi,
        })
    }

    async run(interaction: ButtonInteraction) {
        const [, id, option] = interaction.customId.split(/_/gi)

        const uno = (interaction.client as Client).uno.get(id)
        if (!uno) return interaction.deferUpdate()

        const server = (interaction.client as Client).servers.get(interaction.guildId as string)
        if(!server) return

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
                    content: server.translate('uno_button.start_no_host'),
                    ephemeral: true,
                })
            } else
                interaction.reply({
                    content: server.translate('uno_button.start_out'),
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
    }
}
