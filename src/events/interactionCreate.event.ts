import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { Client } from '../utils/classes.js'
import { sendError } from '../utils/utils.js'

export default async function(interaction: CommandInteraction | ButtonInteraction) {
    try {
        if (interaction.isApplicationCommand()) 
            (interaction.client as Client).commands
                .get(interaction.commandName)
                ?.run(interaction)
        if (interaction.isButton()) 
            (interaction.client as Client).buttons
                .find(btn => btn.regex.test(interaction.customId))
                ?.run(interaction)
    } catch (error) {
        sendError(interaction.client as Client, error as Error, import.meta.url)
    }
}