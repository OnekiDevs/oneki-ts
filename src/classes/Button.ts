import { ButtonInteraction } from 'discord.js'
import { Client } from '../utils/classes.js'

export class Button {
    regex: RegExp
    client: Client

    constructor(client: Client, regex: RegExp) {
        this.regex = regex
        this.client = client
    }

    run(interaction: ButtonInteraction) {
        interaction.reply('pong')
    }
}
