import { MessageEmbed, Message, TextChannel, GuildMember } from 'discord.js'
import { sendError, checkSend } from '../utils/utils.js'
import { Client } from '../utils/classes.js'

export default async function(msg: Message) {
    try {
        if (msg.author.bot) return
        if (!msg.guild) return

        if (!(msg.client as Client).servers.has(msg.guild.id)) return
        const server = (msg.client as Client).servers.get(msg.guild.id ?? '')
        if (!server?.logsChannels.messageDelete) return
        const channel: TextChannel = msg.client.channels.cache.get(
            server.logsChannels.messageDelete
        ) as TextChannel
        if (channel && checkSend(channel, msg.guild.me as GuildMember)) {
            const embed = new MessageEmbed()
            embed.setTitle('Mensaje Eliminado') //LANG:
            embed.setURL(msg.url)
            embed.setColor('RANDOM') //FEATURE: server.logsColors
            embed.setAuthor({
                name: msg.author.username,
                iconURL: msg.author.displayAvatarURL(),
            })
            embed.addField('Eliminado en:', msg.channel.toString(), true) //LANG:
            embed.setTimestamp()
            embed.setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
            embed.addField(
                'Eliminado el:',
                `<t:${Math.round(Date.now() / 1000)}>`,
                true
            ) //Lang:
            if (msg.content)
                embed.setDescription('```\n' + msg.content + '\n```') //LANG:
            embed.setFooter({
                text: `${msg.client.user?.username} Bot v${
                    (msg.client as Client).version
                }`,
                iconURL: msg.client.user?.avatarURL() ?? '',
            })
            channel.send({ embeds: [embed], content: msg.author.id })
        } else {
            if (msg.guild.publicUpdatesChannel && checkSend(msg.guild.publicUpdatesChannel, msg.guild.me as GuildMember))
                msg.guild.publicUpdatesChannel.send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`)
            else {
                const channel = msg.guild.channels.cache.find(c => c.isText() && checkSend(c as TextChannel, msg.guild?.me as GuildMember))
                if (channel) (channel as TextChannel).send(`El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`)
            }
            server.removeMessageDeleteLog()
        }
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
}
