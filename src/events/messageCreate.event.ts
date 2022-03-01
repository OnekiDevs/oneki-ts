import { Message } from "discord.js"
import { Client } from "../utils/classes"
import { sendError } from "../utils/utils"

export const name: string = "messageCreate"

export async function run(msg: Message) {
    try {
        if (msg.attachments.size > 0) msg.client.emit("messageAttachment", msg)
        const server = (msg.client as Client).servers.get(msg.guildId as string)
        const prefix = server?.prefixies.find((p) => msg.content.startsWith(p))
        if (!prefix) return
        const args = msg.content.slice(prefix?.length).split(/ /gi)
        msg.client.emit("command", msg, args.shift(), args)
    } catch (error) {
        sendError(msg.client as Client, error as Error, __filename)
    }
}
