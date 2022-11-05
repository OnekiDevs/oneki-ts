import { Message, PermissionsBitField, TextChannel } from 'discord.js'
import { getServer } from '../../cache/servers.js'
import client from '../../client.js'

export default function (message: Message<true>) {
    const server = getServer(message.guild)
    if (server.disabledChannels.includes(message.channelId)) return //If it's a disabled channel

    try {
        // attachments
        if (
            message.attachments.size > 0 ||
            (message.content.match(
                /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/ // deepscan-disable-line
            ) &&
                message.content.match(
                    /\.(jpeg|jpg|gif|png|webp|mp4|webm|mp3|ogg|wav|flac|aac|m4a|opus|midi|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|rtf|csv|tsv|xml|json|js|css|html|htm|svg|woff2|apng|bmp|tiff|cur|eot|ttf|ico|otf)$/
                ))
        )
            message.client.emit('attachment', message)

        // suggestions
        const cs = server.suggestChannels.find(c => c.channel === message.channelId)
        if (cs && !message.author.bot) {
            const channel = client.channels.cache.get(cs.channel) as TextChannel
            if (channel) {
                server.sendSuggestion(message)
                return message.delete()
            }
        }

        // commands
        const prefix = server.prefixes.find(p => message.content.startsWith(p))
        if (!prefix) return
        const args = message.content.slice(prefix.length).split(/ /gi)
        message.client.emit('command', message, args.shift(), args)
    } catch (error) {
        // sendError(error as Error, import.meta.url)
    }

    if (message.member?.permissions.has(PermissionsBitField.Flags.Administrator)) return //If it's an admin
    if (server.blacklistedWords.includes(message.content.toLowerCase())) return message.delete().catch(() => '')
    return
}
