import { ButtonInteraction, CommandInteraction } from 'discord.js'
import { Client } from '../utils/classes.js'
import { sendError } from '../utils/utils.js'

export const name = 'interactionCreate'

export async function run(interaction: CommandInteraction | ButtonInteraction) {    
    try {
        if (interaction.isApplicationCommand()) {
            //isApplicationCommand
            if ((interaction.client as Client).commands.has(interaction.commandName)) {
                (interaction.client as Client).commands.get(interaction.commandName)?.run(interaction)
            } else {
                interaction.reply({
                    content: '`ctrl` + `R`',
                    ephemeral: true,
                })
            }
        } else if (interaction.isButton()){ 
            const btn = await (interaction.client as Client).buttons.find(btn => btn.regex.test(interaction.customId))
            if (btn) btn.run(interaction)
            else interaction.deferUpdate()        
        }
    } catch (error) {
        sendError(interaction.client as Client, error as Error, import.meta.url)
    }
}