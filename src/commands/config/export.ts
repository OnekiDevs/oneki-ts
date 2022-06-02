import { PermissionsBitField, ChatInputCommandInteraction, Attachment } from 'discord.js'
import { permissionsError } from '../../utils/utils.js'
import { Client, GuildDataBaseModel } from '../../utils/classes.js'

export async function file(interaction: ChatInputCommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    await interaction.deferReply()

    const defaultConfig: GuildDataBaseModel = {
        prefixes: ['>', '?'],
        logs_channels: {
            message_update: undefined,
            message_delete: undefined,
            message_attachment: undefined,
            invite: undefined,
            member_update: undefined
        },
        birthday: {
            message: undefined,
            channel: undefined
        },
        suggest_channels: [],
        autoroles: {},
        disabled_channels: [],
        keep_roles: false
    }

    return interaction.editReply({
        files: [
            new Attachment(
                Buffer.from(JSON.stringify({ ...defaultConfig, ...server.toDBObject() }, null, 4)),
                `${interaction.guild?.name}_${interaction.client.user?.username}_config.json`
            )
        ]
    })
}
