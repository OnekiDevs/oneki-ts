import { sendError } from '../utils/utils.js'
import { Client } from '../utils/classes.js'
import { Message } from 'discord.js'

export default async function (msg: Message<true>, command: string, args: string[] = []) {
    try {
        const client = msg.client as Client
        if (msg.author.bot) return
        client.oldCommands.find(c => {
            return c.name === command.toLowerCase() || c.alias.includes(command.toLowerCase())
        })
        client.commands.get(command)?.message(msg, args)
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}
