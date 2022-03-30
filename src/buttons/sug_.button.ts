import { ButtonInteraction } from 'discord.js'
import { Button, Client } from '../utils/classes.js'

export default class Activitie extends Button {
    constructor(client: Client) {
        super(client, /sug_[ar]_.+/i)
    }

    run(interaction: ButtonInteraction<'cached'>) {
        const [,m,id] = interaction.customId.split(/_/gi)
        const server = this.client.servers.get(interaction.guildId)??this.client.newServer(interaction.guild)
        if (m === 'a') server.aceptSug(id)
        else server.rejectSug(id)
        interaction.deferUpdate()
    }
}