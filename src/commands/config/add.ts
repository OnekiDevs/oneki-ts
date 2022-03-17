import { Permissions, CommandInteraction, TextChannel } from 'discord.js'
import { newServer, permissionsError } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'

export function file(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const prefix = interaction.options.getString('prefix') as string
    server.addPrefix(prefix)
    interaction.reply(server.translate('config_cmd.add_prefix', { prefix, prefixies: server.prefixies }))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
}

export async function suggest_channel(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const channel = interaction.options.getChannel('channel') as TextChannel
    const alias = (interaction.options.getString('alias') as string).toLowerCase()
    const isDefault = interaction.options.getBoolean('default') ?? false
    server.addSuggestChannel({
        channel: channel.id,
        default: isDefault,
        alias: alias,
    })
    interaction.reply(server.translate('config_cmd.add_suggest_channel.reply', { channel, alias }))
    try {
        await channel.sendTyping()
        channel.send(server.translate('config_cmd.add_suggest_channel.message', { channel, alias }))
    } catch (error) {
        // TODO manejar el error
    }
    (interaction.client as Client).commands.get('config')?.deploy(interaction.guild)
    channel.setRateLimitPerUser(21600)
}