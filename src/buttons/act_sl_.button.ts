import { ButtonInteraction } from 'discord.js'
import { Button } from '../utils/classes'

export default class Activitie extends Button {
    constructor() {
        super({
            name: 'act_sl_',
            regex: /act_sl_.+/gi
        })
    }

    run(interaction: ButtonInteraction) {
        const [,,code] = interaction.customId.split(/_/gi)
        interaction.reply(`https://discord.com/invite/${code}`)
    }
}