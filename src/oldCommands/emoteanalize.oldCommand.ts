import { Message, Permissions } from 'discord.js'
import { OldCommand, Client, Server } from '../utils/classes.js'
import { permissionsError } from '../utils/utils.js'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'emote_analize',
            description: 'Start an analysis of emojis from the server',
            alias: ['emoteanalize', 'emojianalize', 'emojianalize'],
            client
        })
    }

    async run(msg: Message<true>, server: Server, args?: string[]) {
        if (!server.premium) return msg.reply(server.translate('premium'))
        if (msg.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(msg, Permissions.FLAGS.ADMINISTRATOR)
        msg.reply(server.translate('emote_analize_old'))
        server.startEmojiAnalisis()
    }
}
