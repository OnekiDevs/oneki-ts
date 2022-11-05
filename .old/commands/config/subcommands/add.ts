import { PermissionsBitField, ChatInputCommandInteraction, TextChannel, GuildMember } from 'discord.js'
import { checkSend, permissionsError, Translator } from '../../../utils/utils.js'
import client from '../../../client.js'

export function prefix(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const server = getServer(interaction.guild)

    const prefix = interaction.options.getString('prefix') as string
    server.addPrefix(prefix)
    interaction.reply(translate('config_cmd.add_prefix', { prefix, prefixies: server.prefixes }))
    client.commands.get('config')?.deploy(interaction.guild)
}

export async function suggest_channel(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const channel = interaction.options.getChannel('channel') as TextChannel
    const alias = (interaction.options.getString('alias') as string).toLowerCase()
    const isDefault = interaction.options.getBoolean('default') ?? false

    if (!checkSend(channel, interaction.guild.members.me as GuildMember))
        return interaction.reply(translate('havent_write_permissions', { channel: channel.toString() }))

    server.addSuggestChannel({
        channel: channel.id,
        default: isDefault,
        alias: alias
    })
    interaction.reply(translate('config_cmd.add_suggest_channel.reply', { channel, alias }))
    await channel.sendTyping()
    channel.send(translate('config_cmd.add_suggest_channel.message', { channel, alias }))
    client.commands.get('config')?.deploy(interaction.guild)
    client.commands.get('suggest')?.deploy(interaction.guild)
    channel.setRateLimitPerUser(21600)
}

export async function blacklisted_word(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const word = interaction.options.getString('word') as string
    server.addBlacklistedWord(word.toLowerCase())

    interaction.editReply(translate('config_cmd.add_blacklisted_word', { word }))
}

export async function ignored_channel(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()

    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const channel = interaction.options.getChannel('channel') as TextChannel
    const channelID = channel.id
    server.addDisabledChannel(channelID)
    interaction.editReply(translate('config_cmd.add_no_filter_channel', { channel: channel.toString() }))
}
