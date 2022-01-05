import { CommandInteraction } from "discord.js";
import { Client } from "../utils/classes";

export const name: string = "interactionCreate";

export function run(interaction: CommandInteraction) {
    if (interaction.isButton()) {
        const name = (interaction.client as Client).buttons.getName(interaction.customId)
        if (name) (interaction.client as Client).buttons.get(name)?.run(interaction)
        else interaction.deferUpdate()
    } else if (interaction.isApplicationCommand()) {
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
