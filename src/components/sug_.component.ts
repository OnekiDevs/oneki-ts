import { ButtonInteraction } from 'discord.js'
import { Component, Client } from '../utils/classes.js'

export default class Activitie extends Component {
    constructor(client: Client) {
        super(client, /sug_[ar]_.+/i)
    }

    button(interaction: ButtonInteraction<'cached'>) {
        const [,m,id] = interaction.customId.split(/_/gi)
        const server = this.client.getServer(interaction.guild)
        if (m === 'a') server.aceptSug(id)
        else server.rejectSug(id)
        interaction.deferUpdate()
    }
}