import { CommandInteraction } from 'discord.js'
import { Command, Client, CommandType } from '../utils/classes.js'
import { translate } from '../utils/utils.js'

export default class SS extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ping',
            description: 'pong',
            type: CommandType.guild
        })
    }

    async run(interaction: CommandInteraction<'cached'>) {
        const t = new translate(interaction)
        t()
        // const c = new t(interaction)
        interaction.reply('pong')
    }
}
