import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { Command } from '../utils/classes.js'
// import { sendError, Translator } from '../utils/utils.js'
// import { getAllCards } from '../classes/UnoCards.js'
// import client from '../client.js'

export default class Settings extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'settings',
                'es-ES': 'configuraciones'
            },
            description: {
                'en-US': 'Config the bot',
                'es-ES': 'Configura el bot'
            }
        })
    }

    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        // const server = client.getServer(interaction.guild)

        const embed = new EmbedBuilder().setDescription('')
        interaction.reply({ embeds: [embed] })
    }
}
