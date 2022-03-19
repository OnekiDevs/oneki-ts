import { Permissions, CommandInteraction } from 'discord.js'
import { newServer, permissionsError } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'

export function suggest_channel(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const channelId = interaction.options.getString('alias')
    if (!channelId) return interaction.reply(server.translate('config_cmd.remove_suggest_channel.dont_exist'))
    server.removeSuggestChannel(channelId)
    interaction.reply(server.translate('config_cmd.remove_suggest_channel.dont_exist'))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export function prefix(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const prefix = interaction.options.getString('prefix') as string
    server.removePrefix(prefix)
    interaction.reply(server.translate('config_cmd.remove_prefix'))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export function log(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const log = interaction.options.getString('logname') as string
    if (log === 'message_update') server.removeMessageUpdateLog()
    else if (log === 'message_delete') server.removeMessageDeleteLog()
    else if (log === 'message_attachment') server.removeMessageAttachmentLog()
    interaction.reply(server.translate('config_cmd.remove_log'))
}

export function birthday_channel(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    server.removeBirthdayChannel()
    interaction.reply(server.translate('config_cmd.birthday.remove_channel'))
}


// const proximos_cumpleanios = [
//     '04/03/2022_464868146846541'
//     '03/03/2023_464868146846541',
// ]

// bd.get()[]

// proximos_cumpleanios.find(c => c.startsWith('03/03/2022'))
// Date.now()
// 464868146846541

// setTimeout(() => {}, 24hrs)