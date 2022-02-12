import { ButtonInteraction, CommandInteraction } from "discord.js";
import { Client } from "../utils/classes";

export const name: string = "interactionCreate";

export async function run(interaction: CommandInteraction | ButtonInteraction) {    
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
    } else if (interaction.isButton()){ 
        console.log(interaction.customId);
           
        const btn = await (interaction.client as Client).buttons.find(btn => btn.regex.test(interaction.customId));
        console.log(btn);
        
        if (btn) btn.run(interaction);
        else interaction.deferUpdate();        
    }
}
