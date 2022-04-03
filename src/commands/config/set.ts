/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandInteraction, Permissions, TextChannel } from 'discord.js'
import { permissionsError, Translator } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'

export function prefix(interaction: CommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const prefix = interaction.options.getString('prefix') as string
    server.setPrefix(prefix)
    interaction.reply(translate('config_cmd.set_prefix', { prefix }))
    ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild) //TODO cambiar a autocompletado
}

export async function suggest_channel(interaction: CommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    const channel = interaction.options.getChannel('channel') as TextChannel
    server.setSuggestChannel(channel)
    interaction.reply(translate('config_cmd.set_suggest_channel.reply', { channel }))
    try {
        await channel.sendTyping()
        channel.send(translate('config_cmd.set_suggest_channel.message'))
    } catch (error) {
        //TODO manejar este error
    }
    (interaction.client as Client).commands.get('config')?.deploy(interaction.guild) //TODO cambiar a autocompletado
}

export async function birthday_channel(interaction: CommandInteraction<'cached'>) {
    await interaction.deferReply()
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)

    const birthdayChannel = interaction.options.getChannel('channel') as TextChannel

    server.setBirthdayChannel(birthdayChannel.id)
    interaction.editReply(translate('config_cmd.birthday.set_channel', { channel: birthdayChannel?.toString() }))
}

export async function birthday_message(interaction: CommandInteraction<'cached'>){
    await interaction.deferReply()
    const translate = Translator(interaction)
    const server = (interaction.client as Client).getServer(interaction.guild)

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)

    const birthdayMessage = interaction.options.getString('message')!
    server.setBirthdayMessage(birthdayMessage)
    interaction.editReply(translate('config_cmd.birthday.set_message', { message: birthdayMessage }))
}

export async function keep_roles(interaction: CommandInteraction<'cached'>){
    await interaction.deferReply()
    const translate = Translator(interaction)
    const server = (interaction.client as Client).getServer(interaction.guild)

    if(!server.premium) return translate('premium')

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)

    const keepRoles = interaction.options.getBoolean('keep_roles')!
    server.setKeepRoles(keepRoles)

    interaction.editReply(translate('config_cmd.set_keep_roles', { keepRole: keepRoles }))
}