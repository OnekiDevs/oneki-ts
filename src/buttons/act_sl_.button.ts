import { ButtonInteraction } from 'discord.js'
import { Button } from '../utils/classes.js'

export default class Activitie extends Button {
    constructor() {
        super({
            name: 'act_sl_',
            regex: /act_sl_.+/i
        })
    }

    run(interaction: ButtonInteraction) {
        const [,,code] = interaction.customId.split(/_/gi)
        interaction.reply(`https://discord.com/invite/${code}`)
    }
}