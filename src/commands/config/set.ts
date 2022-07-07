/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChatInputCommandInteraction, GuildMember, PermissionsBitField, TextChannel } from 'discord.js'
import { checkSend, permissionsError, Translator } from '../../utils/utils.js'
import client from '../../client.js'

export function prefix(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = client.getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const prefix = interaction.options.getString('prefix') as string
    server.setPrefix(prefix)
    interaction.reply(translate('config_cmd.set_prefix', { prefix }))
    ;client.commands.get('config')?.deploy(interaction.guild)
}

export async function suggest_channel(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = client.getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const channel = interaction.options.getChannel('channel') as TextChannel

    if (!checkSend(channel, interaction.guild.members.me as GuildMember))
        return interaction.reply(translate('havent_write_permissions', { channel: channel.toString() }))

    server.setSuggestChannel(channel)
    interaction.reply(translate('config_cmd.set_suggest_channel.reply', { channel: channel.toString() }))
    await channel.sendTyping()
    channel.send(translate('config_cmd.set_suggest_channel.message'))
    client.commands.get('config')?.deploy(interaction.guild)
    client.commands.get('suggest')?.deploy(interaction.guild)
}

export async function birthday_channel(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = client.getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const birthdayChannel = interaction.options.getChannel('channel') as TextChannel

    server.setBirthdayChannel(birthdayChannel.id)
    interaction.editReply(translate('config_cmd.birthday.set_channel', { channel: birthdayChannel?.toString() }))
}

export async function birthday_message(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const server = client.getServer(interaction.guild)

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const birthdayMessage = interaction.options.getString('message')!
    server.setBirthdayMessage(birthdayMessage)
    interaction.editReply(translate('config_cmd.birthday.set_message', { message: birthdayMessage }))
}

export async function keep_roles(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.deferReply()
    const server = client.getServer(interaction.guild)

    const translate = Translator(interaction)
    if (!server.premium) return interaction.editReply(translate('premium'))

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const keepRoles = interaction.options.getBoolean('keep_roles')!
    server.setKeepRoles(keepRoles)

    interaction.editReply(translate('config_cmd.set_keep_roles', { keepRole: keepRoles }))
}
