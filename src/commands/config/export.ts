import { Permissions, CommandInteraction, MessageAttachment } from 'discord.js'
import { newServer, permissionsError } from '../../utils/utils.js'
import { Client } from '../../utils/classes.js'

export async function file(interaction: CommandInteraction<'cached'>) {
    const member = interaction.guild?.members.cache.get(interaction.user.id)
    let server = (interaction.client as Client).servers.get(interaction.guildId)
    if (!server) server = newServer(interaction.guild)
    if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR)
    await interaction.deferReply()
    const snap = await server.db?.get()
    const defaultConfig = {
        prefixies: ['>', '?'],
        lang: 'en',
        logs_channels: {
            message_update: null,
            message_delete: null,
            message_attachment: null,
            birthday_channel: null
        },
        suggest_channels: [
            {
                channel: null,
                default: false,
                alias: null,
            },
        ],
    }
    if (!snap?.exists)
        return interaction.editReply({
            files: [
                new MessageAttachment(
                    Buffer.from(JSON.stringify(defaultConfig, null, 4)),
                    `${interaction.guild?.name}_${interaction.client.user?.username}_config.json`
                ),
            ],
        })
    const sc = snap.data()
    console.log(snap.id, snap.data())
    if (!sc) return
    if (sc.prefixies) defaultConfig.prefixies = sc.prefixies
    if (sc.lang) defaultConfig.lang = sc.lang
    if (sc.logs_channels) {
        const lg = sc.logs_channels
        if (lg.message_update)
            defaultConfig.logs_channels.message_update = lg.message_update
        if (lg.message_attachment)
            defaultConfig.logs_channels.message_attachment = lg.message_attachment
        if (lg.message_delete)
            defaultConfig.logs_channels.message_delete = lg.message_delete
        if (lg.birthday_channel)
            defaultConfig.logs_channels.birthday_channel = lg.birthday_channel
    }
    if (sc.suggest_channels && sc.suggest_channels.length > 0)
        defaultConfig.suggest_channels = sc.suggest_channels
    return interaction.editReply({
        files: [
            new MessageAttachment(
                Buffer.from(JSON.stringify(defaultConfig, null, 4)),
                `${interaction.guild?.name}_${interaction.client.user?.username}_config.json`
            ),
        ],
    })
}