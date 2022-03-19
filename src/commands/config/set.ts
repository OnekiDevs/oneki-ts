/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandInteraction, Permissions, TextChannel } from 'discord.js'
import { permissionsError, newServer } from '../../utils/utils.js'
import { Client, LangType } from '../../utils/classes.js'

export function language(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const lang = interaction.options.getString('lang') as LangType
    server.lang = lang
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

export async function birthday_channel(interaction: CommandInteraction<'cached'>) {
    await interaction.deferReply()
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = (interaction.client as Client).newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const birthdayChannel = interaction.options.getChannel('channel') as TextChannel
    server.setBirthdayChannel(birthdayChannel.id)
    interaction.editReply(server.translate('config_cmd.birthday.set_channel', { channel: birthdayChannel?.toString() }))
}

export async function birthday_message(interaction: CommandInteraction<'cached'>){
    await interaction.deferReply()
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = (interaction.client as Client).newServer(interaction.guild)

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)

    const birthdayMessage = interaction.options.getString('message')!
    server.setBirthdayMessage(birthdayMessage)
    interaction.editReply(server.translate('config_cmd.birthday.set_message', { message: birthdayMessage }))
}