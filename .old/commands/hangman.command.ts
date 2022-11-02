import { ChatInputCommandInteraction, EmbedBuilder, Message, resolveColor } from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'
import { Translator } from '../utils/utils.js'

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
        const translate = Translator(interaction)
        await interaction.deferReply()

        let lcl = interaction.locale.substring(0, 2) as 'es' | 'en'
        if (!['en', 'es'].includes(lcl)) lcl = 'en'
        const word: string = await import('../utils/wordslist.json', { assert: { type: 'json' } }).then(
            words => words.default[lcl][Math.floor(Math.random() * words.default[lcl].length)]
        )
        const letters = word.split('')
        const guessed = new Set<string>()
        const wrong = new Set<string>()
        const maxWrong = 6
        let guessedCount = 0

        const embed = new EmbedBuilder()
            .setTitle(translate('hangman.name'))
            .setDescription(translate('hangman.description'))
            .addFields(
                {
                    name: translate('word'),
                    value: '```' + letters.map(letter => (guessed.has(letter) ? letter : '_')).join(' ') + '```'
                },
                { name: translate('life'), value: '❤️❤️❤️❤️❤️❤️' }
            )
            .setFooter({
                text: translate('hangman.footer')
            })
            .setColor(resolveColor('Random'))
        const message = await interaction.editReply({ embeds: [embed] })
        const filter = (m: Message) => m.author.id === interaction.user.id
        const onErrorInSend = (error: Error) => {
            if (error.message === 'Missing Permissions')
                interaction.editReply({ content: translate('hangman.send_permissiions') })
            else console.log(error)
        }
        const onErrorInDelete = (error: Error) => {
            if (error.message === 'Missing Permissions')
                interaction.editReply({ content: translate('hangman.manage_permissions') })
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
                    await m.reply(translate('hangman.already_guessed')).catch(onErrorInSend)
                }
                if (letters.includes(letter)) guessed.add(letter)
                else wrong.add(letter)

                embed.setFields(
                    {
                        name: translate('word'),
                        value: '```' + letters.map(letter => (guessed.has(letter) ? letter : '_')).join(' ') + '```'
                    },
                    { name: translate('life'), value: '❤️'.repeat(6 - wrong.size) || '0' },
                    {
                        name: translate('hangman.used'),
                        value: '```' + [...guessed, ...wrong].join('') + '```'
                    }
                )
                await interaction.editReply({ embeds: [embed] })
                collector.stop()
            })

            collector.on('end', async (_, reason: string) => {
                console.log(reason)

                if (guessedCount === letters.length) {
                    embed
                        .setTitle(translate('hangman.won'))
                        .setDescription(translate('hangman.won_message'))
                        .setColor(resolveColor('Green'))
                    await interaction.editReply({ embeds: [embed] })
                } else if (wrong.size === maxWrong) {
                    embed
                        .setTitle(translate('hangman.lost'))
                        .setDescription(translate('hangman.lost_message'))
                        .setColor(resolveColor('Red'))
                    await interaction.editReply({ embeds: [embed] })
                } else if (reason === 'time') {
                    embed
                        .setTitle(translate('hangman.timeout'))
                        .setDescription(translate('hangman.lost_message'))
                        .setColor(resolveColor('Red'))
                    await interaction.editReply({ embeds: [embed] })
                } else gameloop()
            })
        }
        gameloop()
    }
}
