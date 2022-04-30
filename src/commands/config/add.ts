import { PermissionsBitField, ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { permissionsError, Translator } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'

export function file(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).servers.get(interaction.guildId) ?? (interaction.client as Client).newServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const prefix = interaction.options.getString('prefix') as string
    server.addPrefix(prefix)
    interaction.reply(translate('config_cmd.add_prefix', { prefix, prefixies: server.prefixes }))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export async function suggest_channel(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const channel = interaction.options.getChannel('channel') as TextChannel
    const alias = (interaction.options.getString('alias') as string).toLowerCase()
    const isDefault = interaction.options.getBoolean('default') ?? false
    server.addSuggestChannel({
        channel: channel.id,
        default: isDefault,
        alias: alias,
    })
    interaction.reply(translate('config_cmd.add_suggest_channel.reply', { channel, alias }))
    try {
        await channel.sendTyping()
        channel.send(translate('config_cmd.add_suggest_channel.message', { channel, alias }))
    } catch (error) {
        // TODO manejar el error
    }
    (interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
    channel.setRateLimitPerUser(21600)
}

export async function blacklisted_word(interaction: ChatInputCommandInteraction<'cached'>){
    await interaction.deferReply()
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const word = interaction.options.getString('word') as string
    server.addBlacklistedWord(word.toLowerCase())

    interaction.editReply(translate('config_cmd.add_blacklisted_word', { word }))
}

export async function ignored_channel(interaction: ChatInputCommandInteraction<'cached'>){
    await interaction.deferReply()

    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const channel = interaction.options.getChannel('channel') as TextChannel
    const channelID = channel.id
    server.addDisabledChannel(channelID)
    interaction.editReply(translate('config_cmd.add_no_filter_channel', { channel: channel.toString() }))
}