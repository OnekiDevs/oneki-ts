import { OldCommand, Client, Server, Message, EmbedBuilder, PermissionsBitField } from '../utils/classes.js'
import { permissionsError, sendError, Translator } from '../utils/utils.js'
import client from '../client.js'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'emote_analize',
            description: 'Start an analysis of emojis from the server',
            alias: ['emoteanalize', 'emojianalize', 'emoji_analize'],
            client
        })
    }

    async run(msg: Message<true>, args: string[]) {
        try {
            const translate = Translator(msg)
            const server = client.getServer(msg.guild)
            if (!server.premium) return msg.reply(translate('premium'))
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
            sendError(error as Error, import.meta.url)
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
            i = 0,
            updateDB = false

        // filtro de emojis vigentes
        const es = []
        for (const key in server.emojiStatistics) {
            const emoji = await msg.guild.emojis
                .fetch(key)
                .then(e => e)
                .catch(() => null)

            if (emoji)
                es.push({
                    name: emoji.toString(),
                    uses: server.emojiStatistics[key]
                })
            else {
                updateDB = true
                delete server.emojiStatistics[key]
            }
        }

        // sort y recorrido
        for (const em of es.sort((a, b) => b.uses - a.uses)) {
            t += `${em.name} --- \`${em.uses}\`\n`

            if (++i == 6) {
                embeds[j].addFields([{ name: 'Emojis', value: t, inline: true }])
                i = 0
                t = ''
            }

            if (embeds[j].data.fields?.length == 25) {
                embeds.push(new EmbedBuilder().setDescription('Emojis uses'))
                j++
            }
        }

        // eliminacion de emojis que no estan vigentes
        if (updateDB)
            server.db
                .update({ emoji_statistics: server.emojiStatistics })
                .catch(() => server.db.set({ emoji_statistics: server.emojiStatistics }))

        // si no hay emojis suficientes para mostrar
        if (t && !embeds[0].data.fields)
            embeds[0].addFields([
                {
                    name: 'Emojis',
                    value: t,
                    inline: true
                }
            ])
        else if (!t) embeds[0].setDescription('Nada de momento')

        // enviar
        msg.reply({ embeds })
    }
}
