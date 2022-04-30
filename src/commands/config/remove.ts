import { PermissionsBitField, ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { permissionsError, Translator } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'

export function suggest_channel(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const channelId = interaction.options.getString('alias')
    if (!channelId) return interaction.reply(translate('config_cmd.remove_suggest_channel.dont_exist'))
    server.removeSuggestChannel(channelId)
    interaction.reply(translate('config_cmd.remove_suggest_channel.dont_exist'))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export function prefix(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const prefix = interaction.options.getString('prefix') as string
    server.removePrefix(prefix)
    interaction.reply(translate('config_cmd.remove_prefix'))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export function log(interaction: ChatInputCommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const translate = Translator(interaction)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const log = interaction.options.getString('logname') as string
    if (log === 'message_update') server.removeMessageUpdateLog()
    else if (log === 'message_delete') server.removeMessageDeleteLog()
    else if (log === 'message_attachment') server.removeAttachmentLog()
    else if (log === 'invite') server.removeInviteChannel()
    else if (log === 'member_update') server.removeMemberUpdateChannel()
    interaction.reply(translate('config_cmd.remove_log'))
}

export function birthday_channel(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    server.removeBirthdayChannel()
    interaction.reply(translate('config_cmd.birthday.remove_channel'))
}

export async function blacklisted_word(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()

    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const word = interaction.options.getString('word') as string
    server.removeBlacklistedWord(word)
    interaction.editReply(translate('config_cmd.remove_blacklisted_word', { word }))
}

export async function ignored_channel(interaction: ChatInputCommandInteraction<'cached'>){
    await interaction.deferReply()

    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const channel = interaction.options.getChannel('channel') as TextChannel
    const channelID = channel.id

    server.removeDisabledChannel(channelID)
    interaction.editReply(translate('config_cmd.remove_no_filter_channel', { channel: channel.toString() }))
}