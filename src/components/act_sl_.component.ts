import { ButtonInteraction } from 'discord.js'
import { Component, Client } from '../utils/classes.js'

export default class Activitie extends Component {
    constructor(client: Client) {
        super(client, /act_sl_.+/i)
    }

    button(interaction: ButtonInteraction) {
        const [,,code] = interaction.customId.split(/_/gi)
        interaction.reply(`https://discord.com/invite/${code}`)
    }
}