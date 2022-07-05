import { PermissionsBitField, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js'
import { permissionsError } from '../../utils/utils.js'
import { GuildDataBaseModel } from '../../utils/classes.js'
import client from '../../client.js'
import YAML from 'yaml'

export async function file(interaction: ChatInputCommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = client.getServer(interaction.guild)
    if (!member?.permissions.has(PermissionsBitField.Flags.Administrator))
        return permissionsError(interaction, PermissionsBitField.Flags.Administrator)
    await interaction.deferReply()

    const type = interaction.options.getString('format') ?? 'json'

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

    const file = (type === 'json' ? JSON : YAML).stringify({ ...defaultConfig, ...server.toDBObject() }, null, 4)

    return interaction.editReply({
        files: [
            new AttachmentBuilder(Buffer.from(file), {
                name: `${interaction.guild?.name}_${client.user.username}_config.${type}`
            })
        ]
    })
}
