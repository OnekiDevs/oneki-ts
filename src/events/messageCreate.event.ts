import { Permissions, Message } from 'discord.js'
import { Client } from '../utils/classes.js'
import { sendError } from '../utils/utils.js'

export default async function(msg: Message<true>) {
    const client = msg.client as Client
    const server = client.getServer(msg.guild)

    //Check if it's a blacklisted word
    if(server.blacklistedWords.length !== 0){ //Check if there are any blacklisted words
        if(!server.noFilterChannels.includes(msg.channelId)){ //If it's not a no filter channel
            if (!msg.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
                if(server.blacklistedWords.includes(msg.content.toLowerCase())) return msg.delete().catch(() => '')
            }
        } 
    }

    try {
        if (
            msg.attachments.size > 0 ||
            (msg.content.match(
                /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
            ) &&
                msg.content.match(
                    /\.(jpeg|jpg|gif|png|webp|mp4|webm|mp3|ogg|wav|flac|aac|m4a|opus|midi|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|rtf|csv|tsv|xml|json|js|css|html|htm|svg|eot|ttf|woff|woff2|otf|ico|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|svg|webp|apng|bmp|tiff|ico|cur|eot|woff|woff2|otf|ttf|)$/
                ))
        ) msg.client.emit('messagAttachment', msg)
        const prefix = server?.prefixes.find(p => msg.content.startsWith(p))
        if (!prefix) return
        const args = msg.content.slice(prefix?.length).split(/ /gi)
        msg.client.emit('command', msg, args.shift(), args)
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
    return
}
