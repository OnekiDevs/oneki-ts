import { ButtonInteraction } from 'discord.js'
import { Button, Client } from '../utils/classes.js'

export default class Activitie extends Button {
    constructor(client: Client) {
        super(client, /autoroll_.+/i)
    }

    run(interaction: ButtonInteraction<'cached'>) {
        const [,rollId] = interaction.customId.split(/_/gi)
        const server = this.client.servers.get(interaction.guildId)??this.client.newServer(interaction.guild)
        if (interaction.member.roles.cache.has(rollId)) {
            interaction.member.roles.remove(rollId)
            interaction.reply({
                content: server.translate('autoroll_btn.remove'),
                ephemeral: true
            })
        } else {
            interaction.member.roles.add(rollId)
            interaction.reply({
                content: server.translate('autoroll_btn.add'),
                ephemeral: true
            })
        }
    }
}