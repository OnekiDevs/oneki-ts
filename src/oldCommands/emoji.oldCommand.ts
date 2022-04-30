import { OldCommand, Client, Server, EmbedBuilder, Message, Colors } from '../utils/classes.js'
import { sendError } from '../utils/utils.js'

export default class Emoji extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'emoji',
            description: 'Get the emoji as a URL',
            alias: ['emote', 'emogi'],
            client
        })
    }

    async run(msg: Message, server: Server, args?: string[]) {
        try {
            const emojiString = (msg.content.match(/<a?:(.+):\d{18}>/) ?? args)?.[0]
            const emojiId = (emojiString ?? '').replace(/<a?:(.+):/, '').replace(/>/, '')
            if (args && args[0] && /\d{18}/.test(emojiId)) {
                fetch(`https://cdn.discordapp.com/emojis/${emojiId}.gif`).then(a => {
                    if (a.status != 200) {
                        fetch(`https://cdn.discordapp.com/emojis/${emojiId}.png`).then(e => {
                            if (e.status != 200) msg.reply(server.translate('emoji_old.missing'))
                            else
                                msg.reply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(Colors.White)
                                            .setImage(e.url)
                                            .addFields([{
                                                name: server.translate('emoji_old.link'),
                                                value: `[PNG](${e.url})`,
                                            }])
                                    ]
                                })
                        })
                    } else
                        msg.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(Colors.White)
                                    .setImage(a.url)
                                    .addFields([{
                                        name: server.translate('emoji_old.link'),
                                        value: `[GIF](${a.url})`,
                                    }])
                            ]
                        })
                })
            } else msg.reply(server!.translate('emoji_old.forget'))
        } catch (error) {
            msg.reply('Ha ocurrido un error, reporte genrado')
            sendError(this.client, error as Error, import.meta.url)
        }
    }
}
