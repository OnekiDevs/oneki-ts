import { Message } from "discord.js";
import { UnoGame } from "../classes/UnoGame";
import { OldCommand, Client } from "../utils/classes";

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: "uno",
            description: "Generate a uno game",
            alias: ["1"],
        });
    }

    async run(msg: Message, args?: string[]) {
        new UnoGame(msg, msg.client as Client);
    }
}
