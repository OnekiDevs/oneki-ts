import fs from "fs";
import { Collection } from "discord.js";
import { OldCommand } from "../utils/classes";
import {join} from "path"

export class OldCommandManager extends Collection<string, OldCommand> {

    constructor(path: string) {
        super();
        for (const file of fs.readdirSync(path).filter((f) => f.endsWith(".oldCommand.js"))) {            
            const command = require(join(path, file));
            
            const cmd: OldCommand = new command.default();
            this.set(cmd.name, cmd);
        }        
    }

    getCommand(name: string) {
        return this.find(c => {            
            return c.name === name.toLowerCase() || c.alias.includes(name.toLowerCase())
        })
    }
}
