import { ButtonInteraction } from 'discord.js'
import { Button, Client } from '../utils/classes.js'

export default class Activitie extends Button {
    constructor() {
        super({
            name: 'autoroll_',
            regex: /autoroll_.+/i
        })
    }

    run(interaction: ButtonInteraction<'cached'>) {
        const [,rollId] = interaction.customId.split(/_/gi)
        const server = (interaction.client as Client).servers.get(interaction.guildId)??(interaction.client as Client).newServer(interaction.guild)
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