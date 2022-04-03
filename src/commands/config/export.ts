import { Permissions, CommandInteraction, MessageAttachment } from 'discord.js'
import { permissionsError } from '../../utils/utils.js'
import { Client, GuildDataBaseModel } from '../../utils/classes.js'

export async function file(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    const server = (interaction.client as Client).servers.get(interaction.guildId) ?? (interaction.client as Client).newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    await interaction.deferReply()

    const defaultConfig: GuildDataBaseModel = {
        prefixes: ['>', '?'],
        logs_channels: {
            message_update: undefined,
            message_delete: undefined,
            message_attachment: undefined
        },
        birthday: {
            message: undefined,
            channel: undefined
        },
        suggest_channels: [],
        autoroles: {}
    }


    return interaction.editReply({
        files: [
            new MessageAttachment(
                Buffer.from(JSON.stringify({...defaultConfig, ...server.toDBObject()}, null, 4)),
                `${interaction.guild?.name}_${interaction.client.user?.username}_config.json`
            ),
        ],
    })
}