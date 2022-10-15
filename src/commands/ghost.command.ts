import {
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
    UserFlagsBitField,
    AttachmentBuilder
} from 'discord.js'
import { Command } from '../utils/classes.js'
import Jimp from 'jimp'
import puppeteer from 'puppeteer'
import { errorCatch } from '../utils/utils.js'
import client from '../client.js'

export default class SS extends Command {
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
                }
            ],
            global: false,
            dm: false
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        await interaction.deferReply()
        const server = await client.getServer(interaction.guild)
        const snapshot = await server.db.collection('events').doc('ghost').get()
        if (!snapshot.exists) return interaction.editReply("the event isn't active in this server")
        const data = snapshot.data() as { [key: string]: number }
        const points = data[interaction.user.id] ?? 0
        return interaction.editReply(`You have ${points} points`)
    }
}
