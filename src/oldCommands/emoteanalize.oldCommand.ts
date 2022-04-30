import { OldCommand, Client, Server, Message, EmbedBuilder, PermissionsBitField } from '../utils/classes.js'
import { permissionsError, sendError } from '../utils/utils.js'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'emote_analize',
            description: 'Start an analysis of emojis from the server',
            alias: ['emoteanalize', 'emojianalize', 'emoji_analize'],
            client
        })
    }

    async run(msg: Message<true>, server: Server, args: string[]) {
        try {
            if (!server.premium) return msg.reply(server.translate('premium'))
            if (!msg.member?.permissions.has(PermissionsBitField.Flags.Administrator))
                return permissionsError(msg, PermissionsBitField.Flags.Administrator)

            if ((args.length === 0 || !['show', 'start', 'stop'].includes(args[0])) && server.emojiAnalisisEnabled)
                this.show(msg, server)
            else if (args.length === 0 || !['show', 'start', 'stop'].includes(args[0])) this.start(msg, server)
            else if (args[0] === 'show') this.show(msg, server)
            else if (args[0] === 'start') this.start(msg, server)
            else this.end(msg, server)
        } catch (error) {
            msg.reply('Ha ocurrido un error, reporte generado')
            sendError(this.client, error as Error, import.meta.url)
        }
    }

    end(msg: Message<true>, server: Server) {
        msg.reply(server.translate('emote_analize_old.end'))
        server.stopEmojiAnalisis()
        this.show(msg, server)
    }

    start(msg: Message<true>, server: Server) {
        msg.reply(server.translate('emote_analize_old.start'))
        server.startEmojiAnalisis()
    }

    async show(msg: Message<true>, server: Server) {
        await msg.channel.sendTyping()
        const embeds = [new EmbedBuilder().setDescription('Emojis uses')]
        let j = 0,
            t = '',
            updateDB = false
        for (const key in server.emojiStatistics) {
            try {
                const emoji = await msg.guild.emojis.fetch(key)
                t += `${emoji} --- ${server.emojiStatistics[key]}\n`
                if (++j == 6) {
                    j = 0
                    embeds[0].addFields([{
                        name: 'Emojis',
                        value: t,
                        inline: true
                    }])
                    //ㅤ
                    t = ''
                }
            } catch (error) {
                delete server.emojiStatistics[key]
                updateDB = true
            }
        }
        if (updateDB) server.db.update({
            emoji_statistics: server.emojiStatistics
        }).catch(() => server.db.set({ emoji_statistics: server.emojiStatistics }))
        
        if (embeds[0].data.fields?.length === 0) embeds[0].addFields([{
            name: 'Emojis',
            value: t,
            inline: true
        }])
        msg.reply({ embeds })
    }
}
