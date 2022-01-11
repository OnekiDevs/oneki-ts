import { Message } from "discord.js";
import { Client } from "../utils/classes";

export const name: string = "command";

export async function run(msg: Message, command: string, args?: string[]) {
    if (msg.author.bot) return;
    const cmd = (msg.client as Client).oldCommands.getCommand(command);
    if(!cmd) return;
    cmd.run(msg, args); 
}
