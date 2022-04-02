import { TextChannel, GuildMember, MessageEmbed, Message } from 'discord.js'
import { checkSend, sendError } from '../utils/utils.js'
import { Client } from '../utils/classes.js'

export default async function(msg: Message) {
    try {
        if (!msg.guild) return
        if (!(msg.client as Client).servers.has(msg.guild?.id ?? '')) return
        const server = (msg.client as Client).servers.get(msg.guild?.id ?? '')
        if (!server?.logsChannels.messageAttachment) return
        if (msg.channel.id === server.logsChannels.messageAttachment) return
        const channel: TextChannel = msg.client.channels.cache.get(
            server.logsChannels.messageAttachment
        ) as TextChannel
        if (channel && checkSend(channel, msg.guild?.me as GuildMember)) {
            channel.send({
                files: msg.attachments.map((attachment) => attachment),
                embeds: [
                    new MessageEmbed()
                        .setTitle(
                            `attachments send by ${msg.member?.displayName}`
                        )
                        .setThumbnail(msg.member?.displayAvatarURL() as string)
                        .addField(
                            'Canal',
                            `${msg.channel} | ${
                                (msg.channel as TextChannel).name ?? ''
                            }`
                        )
                        .setURL(msg.url),
                ],
                content: msg.author.id,
            })
        } else {
            if (
                msg.guild?.publicUpdatesChannel &&
                checkSend(
                    msg.guild?.publicUpdatesChannel,
                    msg.guild.me as GuildMember
                )
            )
                msg.guild?.publicUpdatesChannel.send({
                    content: `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de Attachments, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_attachment** nuevamente`,
                })
            else {
                const channel = msg.guild.channels.cache.find(c => c.isText() && checkSend(c as TextChannel, msg.guild?.me as GuildMember))
                if (channel) (channel as TextChannel).send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de attachments, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_attachment** nuevamente`)
            }
            server.removeMessageDeleteLog()
        }
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
}
