import { CommandInteraction, Permissions, TextChannel } from 'discord.js'
import { permissionsError, newServer } from '../../utils/utils.js'
import { Client, LangType } from '../../utils/classes.js'

export function language(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const lang = interaction.options.getString('lang') as LangType
    server.setLang(lang)
    interaction.reply(server.translate('config_cmd.set_lang', { lang }))
}

export function prefix(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const prefix = interaction.options.getString('prefix') as string
    server.setPrefix(prefix)
    interaction.reply(server.translate('config_cmd.set_prefix', { prefix }))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild) //TODO cambiar a autocompletado
}

export async function suggest_channel(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const channel = interaction.options.getChannel('channel') as TextChannel
    server.setSuggestChannel(channel)
    interaction.reply(server.translate('config_cmd.set_suggest_channel.reply', { channel }))
    try {
        await channel.sendTyping()
        channel.send(server.translate('config_cmd.set_suggest_channel.message'))
    } catch (error) {
        //TODO manejar este error
    }
    (interaction.client as Client).commands.get('config')?.deploy(interaction.guild) //TODO cambiar a autocompletado
}

export function birthday_channel(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const birthdayChannel = interaction.options.getChannel('channel') as TextChannel
    server.setBirthdayChannel(birthdayChannel.id)
    interaction.reply(server.translate('config_cmd.set_birthday', { channel: birthdayChannel?.toString() }))
}