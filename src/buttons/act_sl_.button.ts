import { ButtonInteraction } from 'discord.js'
import { Button, Client } from '../utils/classes.js'

export default class Activitie extends Button {
    constructor(client: Client) {
        super(client, /act_sl_.+/i)
    }

    run(interaction: ButtonInteraction) {
        const [,,code] = interaction.customId.split(/_/gi)
        interaction.reply(`https://discord.com/invite/${code}`)
    }
}