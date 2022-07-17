/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    EmbedBuilder,
    Message,
    TextChannel,
    GuildMember,
    User,
    resolveColor,
    escapeCodeBlock,
    codeBlock
} from 'discord.js'
import { sendError, checkSend, PunishmentType, Translator } from '../utils/utils.js'
import { Client, Server } from '../utils/classes.js'

export default async function (message: Message<true>) {
    try {
        if (!(message.client as Client).servers.has(message.guild.id)) return
        const server = (message.client as Client).getServer(message.guild)
        if (message.author.bot) return
        if (!message.guild) return
        const translate = Translator(message)

        await checkGhostPing(server, message)

        if (!server.logsChannels.messageDelete) return
        const channel: TextChannel = message.client.channels.cache.get(server.logsChannels.messageDelete) as TextChannel

        if (channel && checkSend(channel, message.guild.members.me as GuildMember)) {
            const embed = new EmbedBuilder()
                .setTitle(translate('message_delete_event.deleted'))
                .setURL(message.url)
                .setColor(resolveColor('Random')) //FEATURE: server.logsColors
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp()
                .setThumbnail(message.author.displayAvatarURL())
                .addFields(
                    {
                        name: translate('message_delete_event.in'),
                        value: String(message.channel),
                        inline: true
                    },
                    {
                        name: translate('message_delete_event.on'),
                        value: `<t:${Math.round(Date.now() / 1000)}>`,
                        inline: true
                    }
                )
                .setFooter((message.client as Client).embedFooter)

            if (message.content)
                embed.setDescription(
                    codeBlock(
                        escapeCodeBlock(message.content).length > 1024
                            ? escapeCodeBlock(message.content).substring(0, 1015) + '...'
                            : escapeCodeBlock(message.content)
                    )
                )

            if (message.reference) {
                try {
                    const reference = (await message.fetchReference()) as Message<true>
                    if (reference.content)
                        embed.addFields({
                            name: translate('message_delete_event.reference'),
                            value:
                                reference.member?.displayName +
                                ': \n' +
                                codeBlock(
                                    escapeCodeBlock(reference.content).length > 1024
                                        ? escapeCodeBlock(reference.content).substring(
                                              0,
                                              1013 - (reference.member?.displayName.length as number)
                                          ) + '...'
                                        : escapeCodeBlock(reference.content)
                                )
                        })
                } catch {}
            }

            channel.send({ embeds: [embed], content: message.author.id })
        } else {
            if (
                message.guild.publicUpdatesChannel &&
                checkSend(message.guild.publicUpdatesChannel, message.guild.members.me as GuildMember)
            )
                message.guild.publicUpdatesChannel.send(
                    `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`
                )
            else {
                const channel = message.guild.channels.cache.find(
                    c => c.isTextBased() && checkSend(c as TextChannel, message.guild?.members.me as GuildMember)
                )
                if (channel)
                    (channel as TextChannel).send(
                        `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de mensajes eliminados, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_delete** nuevamente`
                    )
            }
            server.removeMessageDeleteLog()
        }
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}

async function checkGhostPing(server: Server, msg: Message<true>) {
    const translate = Translator(msg)
    const regex = /<@!?\d{18}>/
    if (!regex.test(msg.content)) return

    const user = msg.mentions.users.first()
    if (!user || user === msg.author || user?.bot) return

    const timeBeforeDeletion = new Date().getTime() - msg.createdTimestamp
    const timeBeforeDeletioninSecs = timeBeforeDeletion / 1000

    if (timeBeforeDeletioninSecs > 7) return

    const channel = (await msg.client.channels.fetch('885674115615301650')) as TextChannel
    channel.send({
        content: translate('ghost_ping_event.realized', {
            ghostingUser: msg.member?.toString(),
            ghostedUser: user?.toString()
        }),
        allowedMentions: { users: [] }
    })
    const ghosterSnap = (await server.db.collection('users').doc(msg.author.id).get()).data()
    if (!ghosterSnap) return warnUser(server, channel, msg, user)
    const ghostSanctions = ghosterSnap.sanctions?.filter(
        (sanction: { reason: string }) => sanction.reason === 'Ghost pinging'
    )

    if (!ghostSanctions?.length) return warnUser(server, channel, msg, user)

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
                content: translate('ghost_ping_event.muted', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
        .catch(() => {
            channel.send({
                content: translate('ghost_ping_event.cant_mute', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
}

function warnUser(server: Server, channel: TextChannel, msg: Message<true>, user: User) {
    const translate = Translator(msg)
    server
        .punishUser({
            userId: msg.author.id,
            type: PunishmentType.WARN,
            reason: 'Ghost pinging',
            moderatorId: msg.client.user!.id
        })
        .then(() => {
            channel.send({
                content: translate('ghost_ping_event.warned', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
        .catch(() => {
            channel.send({
                content: translate('ghost_ping_event.cant_warn', {
                    ghostingUser: msg.member?.toString(),
                    ghostedUser: user?.toString()
                }),
                allowedMentions: { users: [] }
            })
        })
}
