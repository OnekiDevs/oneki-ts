import { Message, MessageEmbed } from 'discord.js'
import { OldCommand, Client, Server } from '../utils/classes'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'emoji',
            description: 'Get the emoji as a URL',
            alias: ['emote', 'emogi'],
            client
        })
    }

    async run(msg: Message, args?: string[]) {
        let server = this.client.servers.get(msg.guildId!)
        if (!server) {
            server = new Server(msg.guild!)
            this.client.servers.set(msg.guildId!, server)
        }
        const emojiString = (msg.content.match(/<a?:(.+):\d{18}>/) ?? args)?.[0]
        const emojiId = (emojiString ?? '').replace(/<a?:(.+):/, '').replace(/>/, '')
        if (args && args[0] && /\d{18}/.test(emojiId)) {
            fetch(`https://cdn.discordapp.com/emojis/${emojiId}.gif`).then((a) => {
                if (a.status != 200) {
                    fetch(`https://cdn.discordapp.com/emojis/${emojiId}.png`).then((e) => {
                        if (e.status != 200) msg.reply(server!.translate('emoji_old.missing'))
                        else
                            msg.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor('#ffffff')
                                        .setImage(e.url)
                                        .addField(server!.translate('emoji_old.link'), `[PNG](${e.url})`),
                                ],
                            })
                    })
                } else
                    msg.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#ffffff')
                                .setImage(a.url)
                                .addField(server!.translate('emoji_old.link'), `[GIF](${a.url})`),
                        ],
                    })
            })
        } else msg.reply(server!.translate('emoji_old.forget'))
    }
}
