import { Message, MessageAttachment, Permissions } from 'discord.js'
import { OldCommand, Client, Server } from '../utils/classes.js'
import { permissionsError } from '../utils/utils.js'
import JSZip from 'jszip'

export default class DownloadEmojis extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'downloademojis',
            description: 'Get the emojis in a zip file',
            alias: ['download_emojis', 'descargaremojis', 'descargar_emojis'],
            client
        })
    }

    async run(msg: Message<true>, server: Server, args?: string[]) {
        if (!msg.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(msg, Permissions.FLAGS.ADMINISTRATOR)
        await msg.channel.sendTyping()
        const emojis = await Promise.all((await msg.guild.emojis.fetch()).map(async e => {            
            const res = await fetch(e.url)
            const blob = await res.arrayBuffer()
            return {
                buffer: Buffer.from(blob),
                name: e.name,
                animated: e.animated
            }
        }))

        const zip = new JSZip()
        await Promise.all(emojis.map(e=>zip.file(`${e.name}.${e.animated?'gif':'png'}`, e.buffer)))
        const zipGenerated = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

        msg.reply({
            files: [
                new MessageAttachment(zipGenerated, `${msg.guild.name}_emojis.zip`)
            ]
        })
    }
}
