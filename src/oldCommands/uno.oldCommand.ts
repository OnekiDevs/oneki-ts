import { OldCommand, Client } from '../utils/classes.js'
import { UnoGame } from '../classes/UnoGame.js'
import { sendError } from '../utils/utils.js'
import { Message } from 'discord.js'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'uno',
            description: 'Generate a uno game',
            alias: ['1'],
            client
        })
    }

    async run(msg: Message<true>) {
        try {
            new UnoGame(msg, msg.client as Client)
        } catch (error) {
            msg.reply('Ha ocurrido un error, reporte genrado')  
            sendError(this.client, error as Error, import.meta.url)
        }
    }
}
