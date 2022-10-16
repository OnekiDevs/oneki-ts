import { ChatInputCommandInteraction, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'
import client from '../client.js'

export default class Ghost extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'ghost',
                'es-ES': 'fantasma'
            },
            description: {
                'en-US': 'Halloween Event',
                'es-ES': 'Evento de Halloween'
            },
            options: [
                {
                    name: {
                        'en-US': 'points',
                        'es-ES': 'puntos'
                    },
                    type: ApplicationCommandOptionType.String,
                    description: {
                        'en-US': 'The points of the ghost',
                        'es-ES': 'Los puntos del fantasma'
                    },
                    required: true
                },
                {
                    name: {
                        'en-US': 'top',
                        'es-ES': 'top'
                    },
                    type: ApplicationCommandOptionType.String,
                    description: {
                        'en-US': 'The top 10 of the event',
                        'es-ES': 'El top 10 del evento'
                    },
                    required: true
                }
            ],
            global: false,
            dm: false
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        const subcommand = interaction.options.getSubcommand()
        if (subcommand === 'points') return this.points(interaction)
        else return this.top(interaction)
    }

    @errorCatch(import.meta.url)
    async points(interaction: ChatInputCommandInteraction<'cached'>) {
        await interaction.deferReply()
        const server = await client.getServer(interaction.guild)
        const snapshot = await server.db.collection('events').doc('ghost2022').get()
        if (!snapshot.exists) return interaction.editReply("the event isn't active in this server")
        const data = snapshot.data() as { [key: string]: number }
        const points = data[interaction.user.id] ?? 0
        return interaction.editReply(`You have ${points} points`)
    }

    @errorCatch(import.meta.url)
    async top(interaction: ChatInputCommandInteraction<'cached'>) {
        await interaction.deferReply()
        const server = await client.getServer(interaction.guild)
        const snapshot = await server.db.collection('events').doc('ghost2022').get()
        if (!snapshot.exists) return interaction.editReply("the event isn't active in this server")
        const data = snapshot.data() as { [key: string]: number }
        const top = Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        const embed = new EmbedBuilder()
            .setTitle('Top 10')
            .setDescription(top.map((v, i) => `${i + 1}. <@${v[0]}>: \`${v[1]}\``).join('\n'))
            .setThumbnail(
                'https://www.kindpng.com/picc/m/392-3922815_cute-kawaii-chibi-ghost-halloween-asthetic-tumblr-cartoon.png'
            )
        return interaction.editReply({ embeds: [embed] })
    }
}
