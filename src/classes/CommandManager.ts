import fs from "fs";
import { Collection, Guild } from "discord.js";
import { Command, Client } from "../utils/classes";
import { join } from "path";

export class CommandManager extends Collection<string, Command> {
    client: Client;

    constructor(client: Client, path: string) {
        super();
        this.client = client;
        for (const file of fs.readdirSync(path).filter((f) => f.endsWith(".command.js"))) {
            const command = require(join(path, file));

            const cmd: Command = new command.default(client);
            this.set(cmd.name, cmd);
        }
    }

    deploy(guild?: Guild) {
        console.log(process.env.DEPLOY_COMMANDS == "true");
        
        if (process.env.DEPLOY_COMMANDS == "true") return Promise.all(this.map((command) => command.deploy(guild)));
        else return Promise.resolve();
    }
}
