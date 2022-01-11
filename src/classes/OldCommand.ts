import { Message } from "discord.js";

export class OldCommand {
    name: string = "ping";
    description: string = "pong";
    alias: string[] = []

    constructor(options: {
        name: string;
        description: string;
        alias?: string[];
    }) {
        this.name = options.name;
        this.description = options.description;
        if(options.alias) this.alias = options.alias
    }

    run(msg: Message, args?: string[]) {
        msg.reply('pong')
    }

}
