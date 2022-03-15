import { Message } from 'discord.js'
import { Client } from './Client'

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

    run(msg: Message, args?: string[]) {
        msg.reply('pong')
    }

}
