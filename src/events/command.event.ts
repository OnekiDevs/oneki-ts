import { sendError } from '../utils/utils.js'
import { Message } from 'discord.js'
import client from '../client.js'

export default async function (msg: Message<true>, command: string, args: string[] = []) {
    try {
        if (msg.author.bot) return
        client.oldCommands.getCommand(command)?.run(msg, args)
        client.commands.get(command)?.message(msg, args)
    } catch (error) {
        sendError(error as Error, import.meta.url)
    }
}
