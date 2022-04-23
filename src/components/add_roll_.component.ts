import { ButtonInteraction } from 'discord.js'
import { Component, Client } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'

export default class Activitie extends Component {
    constructor(client: Client) {
        super(client, /autoroll_.+/i)
    }

    button(interaction: ButtonInteraction<'cached'>) {
        const [,rollId] = interaction.customId.split(/_/gi)
        const translate = Translator(interaction)
        if (interaction.member.roles.cache.has(rollId)) {
            interaction.member.roles.remove(rollId)
            interaction.reply({
                content: translate('autoroll_btn.remove'),
                ephemeral: true
            })
        } else {
            interaction.member.roles.add(rollId)
            interaction.reply({
                content: translate('autoroll_btn.add'),
                ephemeral: true
            })
        }
    }
}