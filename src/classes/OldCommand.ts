/* eslint-disable @typescript-eslint/no-unused-vars */
import { Message } from 'discord.js'

export class OldCommand {
    name = 'ping'
    description = 'pong'
    alias: string[] = []

    constructor(options: { name: string; description: string; alias?: string[] }) {
        this.name = options.name
        this.description = options.description
        if (options.alias) this.alias = options.alias
    }

    run(msg: Message<true>, args?: string[]) {
        msg.reply('pong')
    }
}
