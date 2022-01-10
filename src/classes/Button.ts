import { ButtonInteraction } from "discord.js";
import { ButtonOptions } from "../utils/classes";

export class Button {
    regex: RegExp;
    name: string;

    constructor(options: ButtonOptions) {
        this.regex = options.regex;
        this.name = options.name;
    }

    run(interaction: ButtonInteraction) {
        interaction.reply("pong");
    }
}
