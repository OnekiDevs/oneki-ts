import { Permissions, CommandInteraction } from 'discord.js'
import { permissionsError, Translator } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'

export function suggest_channel(interaction: CommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const channelId = interaction.options.getString('alias')
    if (!channelId) return interaction.reply(translate('config_cmd.remove_suggest_channel.dont_exist'))
    server.removeSuggestChannel(channelId)
    interaction.reply(translate('config_cmd.remove_suggest_channel.dont_exist'))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export function prefix(interaction: CommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const prefix = interaction.options.getString('prefix') as string
    server.removePrefix(prefix)
    interaction.reply(translate('config_cmd.remove_prefix'))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export function log(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const translate = Translator(interaction)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const log = interaction.options.getString('logname') as string
    if (log === 'message_update') server.removeMessageUpdateLog()
    else if (log === 'message_delete') server.removeMessageDeleteLog()
    else if (log === 'message_attachment') server.removeMessageAttachmentLog()
    else if (log === 'invite') server.removeInviteChannel()
    else if (log === 'member_update') server.removeMemberUpdateChannel()
    interaction.reply(translate('config_cmd.remove_log'))
}

export function birthday_channel(interaction: CommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    server.removeBirthdayChannel()
    interaction.reply(translate('config_cmd.birthday.remove_channel'))
}