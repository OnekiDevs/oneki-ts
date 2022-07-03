import {
    AnyInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionType,
    ModalSubmitInteraction
} from 'discord.js'
import client from '../client.js';
import { sendError } from '../utils/utils.js'

export default async function (interaction: AnyInteraction) {
    try {
        if (interaction.isChatInputCommand())
            client.commands
                .get(interaction.commandName)
                ?.interacion(interaction as ChatInputCommandInteraction<'cached'>)

        if (interaction.isButton()) {
            ;client.components
                .find(btn => btn.regex.test(interaction.customId))
                ?.button(interaction)
            ;client.commands
                .find(cmd => !!cmd.regex && cmd.regex.test(interaction.customId))
                ?.button(interaction as ButtonInteraction<'cached'>)
        }

        if (interaction.type === InteractionType.ModalSubmit)
            client.commands
                .find(cmd => !!cmd.regex && cmd.regex.test(interaction.customId))
                ?.modal(interaction as ModalSubmitInteraction<'cached'>)
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}
