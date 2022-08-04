import {
    ButtonBuilder,
    ChatInputCommandInteraction,
    Collection,
    ActionRowBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    ButtonInteraction
} from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'

type mark = 'x' | 'o' | 'v'

export default class Tictactoe extends Command {
    games = new Collection<string, any>()
    constructor() {
        super({
            name: {
                'en-US': 'tictactoe',
                'es-ES': 'gato'
            },
            description: {
                'en-US': 'Generates a tic tac toe game',
                'es-ES': 'Genera un juego de gato'
            }
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        // respond with the new table
        interaction.reply({
            components: this.createButtons([
                ['v', 'v', 'v'],
                ['v', 'v', 'v'],
                ['v', 'v', 'v']
            ])
        })
    }

    @errorCatch(import.meta.url)
    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        // check if the game is of the same user
        if (interaction.message.interaction?.user.id !== interaction.user.id) return interaction.deferUpdate()

        // set the mark of the user
        const table = interaction.message.components.map(row =>
            row.components.map(button =>
                button.customId == interaction.customId ? 'x' : button.customId!.split('_').at(-2)
            )
        ) as mark[][]

        // set random mark of the bot
        while (true) {
            const x = Math.floor(Math.random() * 3)
            const y = Math.floor(Math.random() * 3)
            if (table[x][y] == 'v') {
                table[x][y] = 'o'
                break
            }
        }

        // check if the game is finished
        const winner = this.checkWinner(table)
        if (winner === 'v') interaction.reply({ components: this.createButtons(table) })
        else interaction.reply({ components: this.createButtons(table, true) })
    }

    @errorCatch(import.meta.url)
    checkWinner(table: mark[][]) {
        // check rows
        for (let x = 0; x < table.length; x++) {
            if (table[x][0] == table[x][1] && table[x][1] == table[x][2]) {
                return table[x][0]
            }
        }
        // check columns
        for (let y = 0; y < table[0].length; y++) {
            if (table[0][y] == table[1][y] && table[1][y] == table[2][y]) {
                return table[0][y]
            }
        }
        // check diagonals
        if (table[0][0] == table[1][1] && table[1][1] == table[2][2]) {
            return table[0][0]
        }
        if (table[0][2] == table[1][1] && table[1][1] == table[2][0]) {
            return table[0][2]
        }
        return 'v'
    }

    @errorCatch(import.meta.url)
    createButtons(table: mark[][], finished: boolean = false) {
        const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = []
        // set limit of the columns
        table.length = table.length > 5 ? 5 : table.length

        // x
        for (let x = 0; x < table.length; x++) {
            const row = table[x]
            // set limit of the rows
            row.length = row.length > 5 ? 5 : row.length
            // y
            for (let y = 0; y < row.length; y++) {
                const cell = row[y]
                // create the ActionRowBuilder
                components[x] ??= new ActionRowBuilder<MessageActionRowComponentBuilder>()
                // create the ButtonBuilder
                components[x].addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ttt_${y}_${x}_${cell}`)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji({
                            id:
                                cell === 'x'
                                    ? '885693492632879104'
                                    : cell === 'o'
                                    ? '885693508533489694'
                                    : '985343180515987516'
                        })
                        .setDisabled(cell !== 'v' || finished)
                )
            }
        }
        return components
    }
}
