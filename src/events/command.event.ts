import { Message } from "discord.js"
import { Client } from "../utils/classes"
import { sendError } from '../utils/utils'

export const name: string = "command"

export async function run(msg: Message, command: string, args?: string[]) {
    try {
        if (msg.author.bot) return
        const cmd = (msg.client as Client).oldCommands.getCommand(command)
        if (!cmd) return
        cmd.run(msg, args)
    } catch (error) {
        sendError(msg.client as Client, error as Error, __filename)
    }
}
