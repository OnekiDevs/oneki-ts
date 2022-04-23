import { ButtonInteraction } from 'discord.js'
import { Client } from '../utils/classes.js'

export class Component {
    regex: RegExp
    client: Client

    constructor(client: Client, regex: RegExp) {
        this.regex = regex
        this.client = client
    }

    button(interaction: ButtonInteraction) {
        interaction.customId
    }
}