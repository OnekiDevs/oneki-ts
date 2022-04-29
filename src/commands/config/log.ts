import { PermissionsBitField, ChatInputCommandInteraction, TextChannel, CategoryChannel, ChannelType } from 'discord.js'
import { permissionsError, Translator } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'


export function message_update(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const channel = interaction.options.getChannel('channel') as TextChannel
    server.setMessageUpdateLog(channel.id)
    interaction.reply(translate('config_cmd.set_log', { channel }))
}

export function message_delete(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const channel = interaction.options.getChannel('channel') as TextChannel
    server.setMessageDeleteLog(channel.id)
    interaction.reply(translate('config_cmd.set_log', { channel }))
}

export function message_attachment(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const channel = interaction.options.getChannel('channel') as TextChannel
    server.setAttachmentLog(channel.id)
    interaction.reply(translate('config_cmd.set_log', { channel }))
}

export async function auto(interaction: ChatInputCommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)

    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    const category = (interaction.options.getChannel('category') ?? interaction.guild.channels.create('logs', {
        type: ChannelType.GuildCategory,
        permissionOverwrites: [{
            id: interaction.guildId,
            deny: PermissionsBitField.Flags.ViewChannel,
            type: 0,
        }]
    })) as CategoryChannel

    const cm = await category.children.create('messages', {
        type: 0
    })
    server.setMessageDeleteLog(cm.id)
    server.setMessageUpdateLog(cm.id)

    const ca = await category.children.create('attachments', {
        type: 0,
        nsfw: true
    })
    server.setAttachmentLog(ca.id)
}

export async function invites(interaction: ChatInputCommandInteraction<'cached'>){
    await interaction.deferReply()
    const translate = Translator(interaction)
    const server = (interaction.client as Client).getServer(interaction.guild)
    
    if(!server.premium) return interaction.editReply(translate('premium'))

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const inviteChannel = interaction.options.getChannel('channel') as TextChannel
    server.setInviteChannel(inviteChannel.id)
    interaction.editReply(translate('config_cmd.invites.set_channel', { channel: inviteChannel?.toString() }))
}

export async function member_update(interaction: ChatInputCommandInteraction<'cached'>){
    const translate = Translator(interaction)
    await interaction.deferReply()
    const server = (interaction.client as Client).getServer(interaction.guild)

    if(!server.premium) return interaction.editReply(translate('premium'))

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const userActivitieChannel = interaction.options.getChannel('channel') as TextChannel
    server.setMemberUpdateChannel(userActivitieChannel.id)
    interaction.editReply(translate('useractivitie_event.set_channel', { channel: userActivitieChannel.toString() }))
}

export async function sanction(interaction: ChatInputCommandInteraction<'cached'>){
    const translate = Translator(interaction)
    await interaction.deferReply()
    const server = (interaction.client as Client).getServer(interaction.guild)

    const member = interaction.guild?.members.cache.get(interaction.user.id)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator)) return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const sanctionChannel = interaction.options.getChannel('channel') as TextChannel
    server.setSanctionChannel(sanctionChannel.id)
    interaction.editReply(translate('sanction_event.set_channel', { channel: sanctionChannel.toString() }))
}