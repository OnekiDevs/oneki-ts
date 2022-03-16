import { Message } from 'discord.js'
import { Client } from '../utils/classes.js'
import { newServer, sendError } from '../utils/utils.js'

export const name = 'command'

export async function run(msg: Message<true>, command: string, args?: string[]) {
    try {
        if (msg.author.bot) return
        const cmd = (msg.client as Client).oldCommands.getCommand(command)
        if (!cmd) return
        let server = (msg.client as Client).servers.get(msg.guild.id)
        if (!server) server = newServer(msg.guild)
        cmd.run(msg, server, args)
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
}
