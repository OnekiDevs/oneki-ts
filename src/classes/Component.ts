import { ButtonInteraction } from 'discord.js'

export class Component {
    regex: RegExp

    constructor(regex: RegExp) {
        this.regex = regex
    }

    button(interaction: ButtonInteraction) {
        interaction.customId
    }
}
