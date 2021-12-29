import { CommandInteraction } from "discord.js";
import {Client} from "../utils/clases"
export default class interactionCreate {
    name: string = 'interactionCreate';
    client: Client;

    constructor(client: Client) {
        this.client = client;
        this.client.on(this.name, (interaction: CommandInteraction) => {
            if(interaction.isApplicationCommand()){
                if(this.client.commands.has(interaction.commandName)) {
                    this.client.commands.get(interaction.commandName)?.run(interaction)
                } else {
                    interaction.reply({ 
                        content: '`ctrl` + `R`',
                        ephemeral: true
                    })
                }
            }
        })
    }
}
