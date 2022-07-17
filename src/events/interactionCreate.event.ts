import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionType,
    ModalSubmitInteraction,
    Interaction,
    AutocompleteInteraction
} from 'discord.js'
import client from '../client.js'
import { sendError } from '../utils/utils.js'

export default async function (interaction: Interaction) {
    try {
        if (interaction.isChatInputCommand())
            client.commands
                .get(interaction.commandName)
                ?.interacion(interaction as ChatInputCommandInteraction<'cached'>)

        if (interaction.isButton()) {
            client.components.find(btn => btn.regex.test(interaction.customId))?.button(interaction)
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.button(interaction as ButtonInteraction<'cached'>)
        }

        if (interaction.type === InteractionType.ModalSubmit)
            client.commands
                .find(cmd => interaction.customId.startsWith(cmd.name))
                ?.modal(interaction as ModalSubmitInteraction<'cached'>)

        if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
            client.commands.get(interaction.commandName)?.autocomplete(interaction as AutocompleteInteraction<'cached'>)
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}
