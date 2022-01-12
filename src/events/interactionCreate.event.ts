import { CommandInteraction } from "discord.js";
import { Client } from "../utils/classes";

export const name: string = "interactionCreate";

export async function run(interaction: CommandInteraction) {
    if (interaction.isApplicationCommand()) {
        //isApplicationCommand
        if ((interaction.client as Client).commands.has(interaction.commandName)) {
            (interaction.client as Client).commands.get(interaction.commandName)?.run(interaction);
        } else {
            interaction.reply({
                content: "`ctrl` + `R`",
                ephemeral: true,
            });
        }
    }
}
