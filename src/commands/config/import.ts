import { PermissionsBitField, ChatInputCommandInteraction, Attachment } from 'discord.js'
import { permissionsError, Translator } from '../../utils/utils.js'
import { GuildDataBaseModel, Client, SuggestChannelObject } from '../../utils/classes.js'
import YAML from 'yaml'

export async function file(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)

    const { url, contentType } = interaction.options.getAttachment('config') as Attachment

    if (!(!contentType || contentType?.includes('application/json') || contentType?.includes('text/plain')))
        return interaction.reply({
            content: translate('config_cmd.import_file.invalid_file'),
            ephemeral: true
        })

    const file = await fetch(url).then(res => res.text())

    if (!file)
        return interaction.reply({
            content: translate('config_cmd.import_file.error'),
            ephemeral: true
        })

    let json: GuildDataBaseModel
    try {
        if (contentType?.includes('application/json')) json = JSON.parse(file)
        else json = YAML.parse(file)
    } catch {
        return interaction.reply({
            content: translate('config_cmd.import_file.error'),
            ephemeral: true
        })
    }

    const {
        prefixes,
        logs_channels,
        birthday,
        suggest_channels,
        autoroles,
        emoji_analisis_enabled,
        keep_roles,
        disabled_channels
    } = json

    if (prefixes) server.prefixes = prefixes
    if (logs_channels) {
        const { message_update, message_delete, message_attachment, invite, member_update } = logs_channels

        if (message_update) server.setMessageDeleteLog(message_update)
        if (message_delete) server.setMessageDeleteLog(message_delete)
        if (message_attachment) server.setAttachmentLog(message_attachment)
        if (invite) server.setInviteChannel(invite)
        if (member_update) server.setMemberUpdateChannel(member_update)
    }
    if (birthday) {
        const { message, channel } = birthday

        if (channel) server.setBirthdayChannel(channel)
        if (message) server.setBirthdayMessage(message)
    }
    suggest_channels?.forEach((channel: SuggestChannelObject) => server.addSuggestChannel(channel))
    if (autoroles) for (const [key, value] of Object.entries(autoroles)) server.autoroles.set(key, new Set(value))
    if (emoji_analisis_enabled) server.startEmojiAnalisis()
    if (keep_roles) server.setKeepRoles(true)
    disabled_channels?.forEach(c => server.addDisabledChannel(c))

    interaction.reply(translate('config_cmd.import_file.reply'))
}
