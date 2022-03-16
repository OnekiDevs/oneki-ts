import { Message } from 'discord.js'
import { UnoGame } from '../classes/UnoGame'
import { OldCommand, Client, Server } from '../utils/classes'

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: 'uno',
            description: 'Generate a uno game',
            alias: ['1'],
            client
        })
    }

    async run(msg: Message, server: Server, args?: string[]) {
        new UnoGame(msg, msg.client as Client)
    }
}
