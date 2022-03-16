import { Message } from 'discord.js'
import { Client, Server } from '../utils/classes'

export class OldCommand {
    name = 'ping'
    description = 'pong'
    alias: string[] = []
    client: Client

    constructor(options: {
        name: string;
        description: string;
        alias?: string[];
        client: Client;
    }) {
        this.client = options.client
        this.name = options.name
        this.description = options.description
        if(options.alias) this.alias = options.alias
    }

    run(msg: Message, server: Server, args?: string[]) {
        msg.reply('pong')
    }

}
