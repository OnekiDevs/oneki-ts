import { ButtonInteraction } from 'discord.js'
import { Button, Client } from '../utils/classes.js'

export default class Activitie extends Button {
    constructor() {
        super({
            name: 'sug_',
            regex: /sug_[ar]_.+/i
        })
    }

    run(interaction: ButtonInteraction<'cached'>) {
        const [,m,id] = interaction.customId.split(/_/gi)
        let server = (interaction.client as Client).servers.get(interaction.guildId)
        if (!server) server = (interaction.client as Client).newServer(interaction.guild)
        if (m === 'a') server.aceptSug(id)
        else server.rejectSug(id)
        interaction.deferUpdate()
    }
}