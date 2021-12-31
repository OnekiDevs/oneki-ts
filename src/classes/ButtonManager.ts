import fs from "fs";
import { Collection } from "discord.js";
import { Button, Client } from "../utils/classes";
import {join} from "path"

export class ButtonManager extends Collection<string, Button> {
    client: Client;

    constructor(client: Client, path: string) {
        super();
        this.client = client;
        for (const file of fs.readdirSync(path).filter((f) => f.endsWith(".buttons.js"))) {            
            const button = require(join(path, file));
            
            const btn: Button = new button.default(client);
            this.set(btn.name, btn);
        }
    }

    getName(customId: string): string | null {
        const btn = this.find(b=>b.regex.test(customId))
        return btn?.name??null;
    }
}
