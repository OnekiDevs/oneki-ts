/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EmbedBuilder, Message, TextChannel, GuildMember, User } from 'discord.js'
import { sendError, checkSend, PunishmentType, Util } from '../utils/utils.js'
import { Client, Server } from '../utils/classes.js'

export default async function (msg: Message<true>) {
    if (!(msg.client as Client).servers.has(msg.guild.id)) return
    const server = (msg.client as Client).getServer(msg.guild)
    if (msg.author.bot) return
    if (!msg.guild) return

    await checkGhostPing(server, msg)

    try {
        if (!server?.logsChannels.messageDelete) return
        const channel: TextChannel = msg.client.channels.cache.get(server.logsChannels.messageDelete) as TextChannel
        if (channel && checkSend(channel, msg.guild.members.me as GuildMember)) {
            const embed = new EmbedBuilder()
            embed.setTitle('Mensaje Eliminado') //LANG:
            embed.setURL(msg.url)
            embed.setColor(Util.resolveColor('Random')) //FEATURE: server.logsColors
            embed.setAuthor({
                name: msg.author.username,
                iconURL: msg.author.displayAvatarURL()
            })
            embed.setTimestamp()
            embed.setThumbnail(msg.author.displayAvatarURL())
            embed.addFields([
                {
                    name: 'Eliminado en:',
                    value: String(msg.channel),
                    inline: true
                },
                {
                    name: 'Eliminado el:',
                    value: `<t:${Math.round(Date.now() / 1000)}>`,
                    inline: true
                }
            ])
            if (msg.content) embed.setDescription('```\n' + msg.content + '\n```') //LANG:
            embed.setFooter({
                text: `${msg.client.user?.username} Bot v${(msg.client as Client).version}`,
                iconURL: msg.client.user?.avatarURL() ?? ''
            })
            channel.send({ embeds: [embed], content: msg.author.id })
        } else {
            if (
                msg.guild.publicUpdatesChannel &&
                checkSend(msg.guild.publicUpdatesChannel, msg.guild.members.me as GuildMember)
            )
                msg.guild.publicUpdatesChannel.send(
                    `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`
                )
            else {
                const channel = msg.guild.channels.cache.find(
                    c => c.isText() && checkSend(c as TextChannel, msg.guild?.members.me as GuildMember)
                )
                if (channel)
                    (channel as TextChannel).send(
                        `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`
                    )
            }
            server.removeMessageDeleteLog()
        }
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
}

async function checkGhostPing(server: Server, msg: Message) {
    const regex = /<@!?\d{18}>/
    if (!regex.test(msg.content)) return

    const user = msg.mentions.users.first()
    if (!user || user === msg.author || user?.bot) return

    const timeBeforeDeletion = new Date().getTime() - msg.createdTimestamp
    const timeBeforeDeletioninSecs = timeBeforeDeletion / 1000

    if (timeBeforeDeletioninSecs > 7) return

    const channel = (await msg.client.channels.fetch('885674115615301650')) as TextChannel
    channel.send({
        content: server.translate('ghost_ping_event.realized', {
            ghostingUser: msg.member?.toString(),
            ghostedUser: user?.toString()
        }),
        allowedMentions: { users: [] }
    })
    const ghosterSnap = (await server.db.collection('users').doc(msg.author.id).get()).data()
    if (!ghosterSnap) return warnUser(server, channel, msg, user)

    const ghostSanctions = ghosterSnap.sanctions.filter(
        (sanction: { reason: string }) => sanction.reason === 'Ghosting'
    )

    if (!ghostSanctions) return warnUser(server, channel, msg, user)

    server
        .punishUser({
            userId: msg.author.id,
            type: PunishmentType.MUTE,
            reason: 'Ghost pinging',
            duration: '10m',
            moderatorId: msg.client.user!.id
        })
        .then(() => {
            channel.send({
                content: server.translate('ghost_ping_event.muted', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
        .catch(() => {
            channel.send({
                content: server.translate('ghost_ping_event.cant_mute', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
}

function warnUser(server: Server, channel: TextChannel, msg: Message, user: User) {
    server
        .punishUser({
            userId: msg.author.id,
            type: PunishmentType.WARN,
            reason: 'Ghost pining',
            moderatorId: msg.client.user!.id
        })
        .then(() => {
            channel.send({
                content: server.translate('ghost_ping_event.warned', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
        .catch(() => {
            channel.send({
                content: server.translate('ghost_ping_event.cant_warn', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
}
