import { sendError } from '../utils/utils.js'
import { Client } from '../utils/classes.js'
import { Message } from 'discord.js'

export default async function(msg: Message<true>, command: string, args?: string[]) {
    try {
        if (msg.author.bot) return
        const cmd = (msg.client as Client).oldCommands.getCommand(command)
        if (!cmd) return
        let server = (msg.client as Client).servers.get(msg.guild.id)
        if (!server) server = (msg.client as Client).newServer(msg.guild)
        cmd.run(msg, server, args)
    } catch (error) {
        sendError(msg.client as Client, error as Error, import.meta.url)
    }
}
