import {
    ChatInputCommandInteraction,
    GuildMember,
    TextChannel,
    ButtonInteraction,
    AutocompleteInteraction
} from 'discord.js'
import { Translator, checkSend } from 'offdjs'
import client from '../client.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const server = client.getServer(interaction.guild)

    if (!server.suggestChannels.length)
        return interaction.reply({
            content: translate('suggest_cmd.whitout_channel'),
            ephemeral: true
        })

    const channelId = interaction.options.getString('channel') ?? server.suggestChannels[0].channel
    const channel = client.channels.cache.get(channelId as string) as TextChannel

    if (channel && checkSend(channel, interaction.guild?.members.me as GuildMember)) {
        server.sendSuggestion(interaction)
        return interaction.reply({ content: translate('suggest_cmd.sent'), ephemeral: true })
    } else if (checkSend(channel, interaction.guild?.members.me as GuildMember)) {
        return interaction.reply({
            content: translate('suggest_cmd.error_permissions', {
                channel,
                owner: '<#' + interaction.guild?.ownerId + '>'
            }),
            ephemeral: true
        })
    } else if (!channelId || !channel) {
        server.removeSuggestChannel(channelId as string)
        return interaction.reply({ content: translate('suggest_cmd.missing_channel'), ephemeral: true })
    } else return
}

export async function buttonInteraction(interaction: ButtonInteraction<'cached'>): Promise<any> {
    const [, m, id] = interaction.customId.split(/_/gi)
    const server = client.getServer(interaction.guild)
    if (m === 'a') server.aceptSug(id)
    else server.rejectSug(id)
    return interaction.deferUpdate()
}

export async function autocompleteInteraction(interaction: AutocompleteInteraction<'cached'>): Promise<any> {
    const server = client.getServer(interaction.guild)
    return interaction.respond(
        server.suggestChannels.map(c => ({
            name: c.default ? 'default' : c.alias!,
            value: c.channel
        }))
    )
}
