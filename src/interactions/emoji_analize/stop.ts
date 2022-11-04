import { Translator } from 'offdjs'
import { ChatInputCommandInteraction } from 'discord.js'
import client from '../../client.js'
import { chatInputCommandInteraction as show } from './show.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
    const translate = Translator(interaction)
    const server = client.getServer(interaction.guild)

    interaction.reply(translate('emote_analize_old.end'))
    server.stopEmojiAnalisis()
    show(interaction)
}
