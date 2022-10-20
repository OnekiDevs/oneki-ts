import { ChatInputCommandInteraction, EmbedBuilder, Message, resolveColor } from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'

export default class Hangman extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'hangman',
                'es-ES': 'ahorcado'
            },
            description: {
                'en-US': 'Play hangman',
                'es-ES': 'Juega al ahorcado'
            },
            global: false
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        await interaction.deferReply()

        const word = await import('../utils/wordslist.json', { assert: { type: 'json' } }).then(
            words => words.default[Math.floor(Math.random() * words.default.length)]
        )
        const letters = word.split('')
        const guessed = new Set<string>()
        const wrong = new Set<string>()
        const maxWrong = 6
        let guessedCount = 0

        const embed = new EmbedBuilder()
            .setTitle('Hangman')
            .setDescription('Guess the word!')
            .addFields(
                {
                    name: 'Word',
                    value: '```' + letters.map(letter => (guessed.has(letter) ? letter : '_')).join(' ') + '```'
                },
                { name: 'Life', value: '❤️❤️❤️❤️❤️❤️' }
            )
            .setFooter({
                text: 'You have 1 minute to guess the word'
            })
            .setColor(resolveColor('Random'))
        const message = await interaction.editReply({ embeds: [embed] })
        const filter = (m: Message) => m.author.id === interaction.user.id
        const onErrorInSend = (error: Error) => {
            if (error.message === 'Missing Permissions')
                interaction.editReply({ content: 'I need the `Send Messages` permission to play hangman' })
            else console.log(error)
        }
        const onErrorInDelete = (error: Error) => {
            if (error.message === 'Missing Permissions')
                interaction.editReply({ content: 'I need the `Manage Messages` permission to play hangman correctly' })
            else console.log(error)
        }
        const gameloop = () => {
            const collector = message.channel.createMessageCollector({ filter, time: 60_000 })

            collector.on('collect', async function (m: Message): Promise<any> {
                console.log(m.content)
                m.delete().catch(onErrorInDelete)
                const letter = m.content
                    .toLowerCase()
                    .replace(/[^a-z]/g, '')
                    .substring(0, 1)
                if (guessed.has(letter) || wrong.has(letter)) {
                    await m.reply('You already guessed that letter!').catch(onErrorInSend)
                }
                if (letters.includes(letter)) guessed.add(letter)
                else wrong.add(letter)

                embed.setFields(
                    {
                        name: 'Word',
                        value: '```' + letters.map(letter => (guessed.has(letter) ? letter : '_')).join(' ') + '```'
                    },
                    { name: 'Life', value: '❤️'.repeat(6 - wrong.size) || '0' },
                    {
                        name: 'letters used',
                        value: '```' + [...guessed, ...wrong].join('') + '```'
                    }
                )
                await interaction.editReply({ embeds: [embed] })
                collector.stop()
            })

            collector.on('end', async (_, reason: string) => {
                console.log(reason)

                if (guessedCount === letters.length) {
                    embed.setTitle('You won!').setDescription('You guessed the word!').setColor(resolveColor('Green'))
                    await interaction.editReply({ embeds: [embed] })
                } else if (wrong.size === maxWrong) {
                    embed
                        .setTitle('You lost!')
                        .setDescription("You didn't guess the word!")
                        .setColor(resolveColor('Red'))
                        .setFooter({ text: 'Game Over' })
                    await interaction.editReply({ embeds: [embed] })
                } else if (reason === 'time') {
                    embed
                        .setTitle('Time out!')
                        .setDescription("You didn't guess the word!")
                        .setColor(resolveColor('Red'))
                        .setFooter({ text: 'Game Over' })
                    await interaction.editReply({ embeds: [embed] })
                } else gameloop()
            })
        }
        gameloop()
    }
}
