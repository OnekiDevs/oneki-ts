import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { Client } from '../utils/classes.js'
import { sendError } from '../utils/utils.js'

export default async function(interaction: ChatInputCommandInteraction | ButtonInteraction) {
    try {
        if (interaction.isChatInputCommand()) 
            (interaction.client as Client).commands
                .get(interaction.commandName)
                ?.interacion(interaction as ChatInputCommandInteraction<'cached'>)
        if (interaction.isButton()) {
            (interaction.client as Client).components
                .find(btn => btn.regex.test(interaction.customId))
                ?.button(interaction);
            (interaction.client as Client).commands
                .find(cmd => !!cmd.regex && cmd.regex.test(interaction.customId))
                ?.button(interaction as ButtonInteraction<'cached'>)
        }
    } catch (error) {
        sendError(interaction.client as Client, error as Error, import.meta.url)
    }
}