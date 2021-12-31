import { CommandInteraction } from "discord.js";
import { Client } from "../utils/classes";

export const name: string = "interactionCreate";

export function run(client: Client, interaction: CommandInteraction) {
    if (interaction.isButton()) {
        const name = client.buttons.getName(interaction.customId)
        if (name) client.buttons.get(name)?.run(interaction)
        else interaction.deferUpdate()
    } else if (interaction.isApplicationCommand()) {
        //isApplicationCommand
        if (client.commands.has(interaction.commandName)) {
            client.commands.get(interaction.commandName)?.run(interaction);
        } else {
            interaction.reply({
                content: "`ctrl` + `R`",
                ephemeral: true,
            });
        }
    }
}
