import { PermissionsBitField, Message, EmbedBuilder, TextChannel } from 'discord.js'
import { Client } from '../utils/classes.js'
import { sendError, Translator } from '../utils/utils.js'

export default async function (msg: Message<true>) {
    const client = msg.client as Client
    const server = client.getServer(msg.guild)
    const translate = Translator(msg)
    if (server.disabledChannels.includes(msg.channelId)) return //If it's a disabled channel

    try {
        // attachments
        if (
            msg.attachments.size > 0 ||
            (msg.content.match(
                /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
            ) &&
                msg.content.match(
                    /\.(jpeg|jpg|gif|png|webp|mp4|webm|mp3|ogg|wav|flac|aac|m4a|opus|midi|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|rtf|csv|tsv|xml|json|js|css|html|htm|svg|woff2|apng|bmp|tiff|cur|eot|ttf|ico|otf)$/
                ))
        )
            msg.client.emit('Attachment', msg)

        // suggestions
        const cs = server.suggestChannels.find(c => c.channel === msg.channelId)
        if (cs) {
            const channel = client.channels.cache.get(cs.channel) as TextChannel
            if (channel) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: msg.author.username,
                        iconURL: msg.author.displayAvatarURL()
                    })
                    .setTitle(translate('suggest_cmd.title', { id: server?.lastSuggestId }))
                    .setColor(16313844)
                    .setDescription(msg.content)
                    .setFooter(client.embedFooter)
                    .setTimestamp()
                channel
                    .send({
                        embeds: [embed]
                    })
                    .then(msg => {
                        msg.startThread({
                            name: translate('suggest_cmd.sent', { id: server?.lastSuggestId })
                        })
                        server.db.collection('suggests').doc(`suggest_${server.lastSuggestId}`).set({
                            author: msg.author.id,
                            channel: msg.channel.id,
                            suggest: msg.content
                        })
                    })
                server.lastSuggestId += 1
            }
        }

        // commands
        const prefix = server?.prefixes.find(p => msg.content.startsWith(p))
        if (!prefix) return
        const args = msg.content.slice(prefix?.length).split(/ /gi)
        msg.client.emit('command', msg, args.shift(), args)
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }

    if (msg.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return //If it's an admin
    if (server.blacklistedWords.includes(msg.content.toLowerCase())) return msg.delete().catch(() => '')
    return
}
