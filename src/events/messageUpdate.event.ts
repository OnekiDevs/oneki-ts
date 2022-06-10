import { Client } from '../utils/classes.js'
import { EmbedBuilder, Message, TextChannel, GuildMember } from 'discord.js'
import { checkSend, sendError, Util } from '../utils/utils.js'

export default async function (old: Message<true>, msg: Message<true>) {
    try {
        if (msg.author.bot) return
        if (!msg.guild) return
        if (!(msg.client as Client).servers.has(msg.guild?.id ?? '')) return
        const server = (msg.client as Client).getServer(msg.guild)
        if (!server?.logsChannels.messageUpdate) return
        const channel: TextChannel = msg.client.channels.cache.get(server.logsChannels.messageUpdate) as TextChannel
        if (channel && checkSend(channel, msg.guild?.members.me as GuildMember)) {
            const embed = new EmbedBuilder()
                .setTitle('Mensaje Editado') //LANG:
                .setURL(msg.url)
                .setColor(Util.resolveColor('Random')) //FEATURE: server.logsColors
                .setAuthor({
                    name: msg.author.username,
                    iconURL: msg.author.displayAvatarURL()
                })
                .addFields([
                    {
                        name: 'Enviado en:',
                        value: String(msg.channel),
                        inline: true
                    },
                    {
                        name: 'Editado el:',
                        value: `<t:${Math.round(Date.now() / 1000)}>`,
                        inline: true
                    },
                    {
                        name: 'Escrito el:',
                        value: `<t:${Math.round(old.createdTimestamp / 1000)}>`,
                        inline: true
                    }
                ])
                .setTimestamp()
                .setThumbnail(msg.author.displayAvatarURL({}))
            if (old.content)
                embed.addFields([
                    {
                        name: 'Antes:',
                        value: Util.escapeCodeBlock(old.content)
                    }
                ])
            if (msg.content)
                embed.addFields([
                    {
                        name: 'Despues:',
                        value: Util.escapeCodeBlock(msg.content)
                    }
                ])
            embed.setFooter({
                text: `${msg.client.user?.username} Bot v${(msg.client as Client).version}`,
                iconURL: msg.client.user?.avatarURL() ?? ''
            })
            channel.send({ embeds: [embed], content: msg.author.id })
        } else {
            if (
                msg.guild?.publicUpdatesChannel &&
                checkSend(msg.guild?.publicUpdatesChannel, msg.guild.members.me as GuildMember)
            )
                msg.guild?.publicUpdatesChannel.send({
                    content: `El canal <#${server.logsChannels.messageUpdate}> esta configurado para mostrar logs de mensajes editados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_update** nuevamente`
                })
            else {
                const channel = msg.guild.channels.cache.find(
                    c => c.isTextBased() && checkSend(c as TextChannel, msg.guild?.members.me as GuildMember)
                )
                if (channel)
                    (channel as TextChannel).send(
                        `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes editados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_update** nuevamente`
                    )
            }
            server.removeMessageUpdateLog()
        }
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
}
