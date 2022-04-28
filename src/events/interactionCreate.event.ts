import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { Client } from '../utils/classes.js'
import { sendError } from '../utils/utils.js'

export default async function(interaction: ChatInputCommandInteraction | ButtonInteraction) {
    try {
        if (interaction.isChatInputCommand()) 
            (interaction.client as Client).commands
                .get(interaction.commandName)
                ?.run(interaction)
        if (interaction.isButton()) 
            (interaction.client as Client).components
                .find(btn => btn.regex.test(interaction.customId))
                ?.button(interaction)
    } catch (error) {
        sendError(interaction.client as Client, error as Error, import.meta.url)
    }
}