/* eslint-disable @typescript-eslint/no-explicit-any */
import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'
import Jimp from 'jimp'

export default class Matatena extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'matatena',
                'es-ES': 'matatena'
            },
            description: {
                'en-US': 'Dsplay a matatena game',
                'es-ES': 'Muestra un juego de matatena'
            }
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        await interaction.deferReply()
        const image = new Jimp(500, 500, 0x000000ff)
        const img = await image.getBufferAsync(Jimp.MIME_PNG)
        interaction.reply({
            files: [new AttachmentBuilder(img)]
        })
    }
}
