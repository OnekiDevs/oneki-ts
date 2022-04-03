import { Client } from '../utils/classes.js'
import { MessageEmbed, Message, TextChannel, GuildMember } from 'discord.js'
import { checkSend, sendError } from '../utils/utils.js'

export default async function(old: Message<true>, msg: Message<true>) {
    try {
        if (msg.author.bot) return
        if (!msg.guild) return
        if (!(msg.client as Client).servers.has(msg.guild?.id ?? '')) return
        const server = (msg.client as Client).getServer(msg.guild)
        if (!server?.logsChannels.messageUpdate) return
        const channel: TextChannel = msg.client.channels.cache.get(
            server.logsChannels.messageUpdate
        ) as TextChannel
        if (channel && checkSend(channel, msg.guild?.me as GuildMember)) {
            const embed = new MessageEmbed()
            embed.setTitle('Mensaje Editado') //LANG:
            embed.setURL(msg.url)
            embed.setColor('RANDOM') //FEATURE: server.logsColors
            embed.setAuthor({
                name: msg.author.username,
                iconURL: msg.author.displayAvatarURL(),
            })
            embed.addField('Editado en:', msg.channel.toString(), true) //LANG:
            embed.setTimestamp()
            embed.setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            embed.addField(
                'Escrito el:',
                `<t:${Math.round(msg.createdTimestamp / 1000)}>`,
                true
            ) //Lang:
            embed.addField(
                'Editado el:',
                `<t:${Math.round(Date.now() / 1000)}>`,
                true
            ) //LANG:
            if (old.content)
                embed.addField('Antes', '```\n' + old.content + '\n```', false) //LANG:
            if (msg.content)
                embed.addField(
                    'Despues',
                    '```\n' + msg.content + '\n```',
                    false
                ) //LANG:
            embed.setFooter({
                text: `${msg.client.user?.username} Bot v${
                    (msg.client as Client).version
                }`,
                iconURL: msg.client.user?.avatarURL() ?? '',
            })
            channel.send({ embeds: [embed], content: msg.author.id })
        } else {
            if (
                msg.guild?.publicUpdatesChannel &&
                checkSend(
                    msg.guild?.publicUpdatesChannel,
                    msg.guild.me as GuildMember
                )
            )
                msg.guild?.publicUpdatesChannel.send({
                    content: `El canal <#${server.logsChannels.messageUpdate}> esta configurado para mostrar logs de mensajes editados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_update** nuevamente`,
                })
            else {
                const channel = msg.guild.channels.cache.find(c => c.isText() && checkSend(c as TextChannel, msg.guild?.me as GuildMember))
                if (channel) (channel as TextChannel).send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes editados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_update** nuevamente`)
            }
            server.removeMessageUpdateLog()
        }
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
}
