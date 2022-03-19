import { OldCommand, Client, Server } from '../utils/classes.js'
import { permissionsError } from '../utils/utils.js'
import { Message, MessageEmbed, Permissions } from 'discord.js'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'emote_analize',
            description: 'Start an analysis of emojis from the server',
            alias: ['emoteanalize', 'emojianalize', 'emojianalize'],
            client
        })
    }

    async run(msg: Message<true>, server: Server, args: string[]) {
        if (!server.premium) return msg.reply(server.translate('premium'))
        if (!msg.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(msg, Permissions.FLAGS.ADMINISTRATOR)

        console.log((args.length === 0 || !['show', 'start', 'stop'].includes(args[0])) && server.emojiAnalisisEnabled)

        if ((args.length === 0 || !['show', 'start', 'stop'].includes(args[0])) && server.emojiAnalisisEnabled) this.show(msg, server)
        else if (args.length === 0 || !['show', 'start', 'stop'].includes(args[0])) this.start(msg, server)
        else if (args[0] === 'show') this.show(msg, server)
        else if (args[0] === 'start') this.start(msg, server)
        else this.end(msg, server)
    }

    end(msg: Message<true>, server: Server) {
        msg.reply(server.translate('emote_analize_old.end'))
        server.stopEmojiAnalisis()
        this.show(msg, server)
    }

    start(msg: Message<true>, server: Server){
        msg.reply(server.translate('emote_analize_old.start'))
        server.startEmojiAnalisis()
    }

    async show(msg: Message<true>, server: Server){
        await msg.channel.sendTyping()
        const embeds = [new MessageEmbed().setDescription('Emojis uses')]
        let j = 0, t = ''
        for (const key in server.emojiStatistics) {
            const emoji = await msg.guild.emojis.fetch(key)
            if (emoji) t += `${emoji} --- ${server.emojiStatistics[key]}`
            if (++j == 6) {
                j = 0
                embeds[0].addField('ㅤ', t, true)
                t = ''
            }
        }
        if (embeds[0].fields.length === 0) embeds[0].addField('ㅤ', t, true)
        msg.reply({embeds})
    }
}
