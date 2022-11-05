import { Translator } from 'offdjs'
import { ChatInputCommandInteraction } from 'discord.js'
import { getServer } from '../../cache/servers.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
    const translate = Translator(interaction)
    const server = getServer(interaction.guild)

    interaction.reply(translate('emote_analize_old.start'))
    server.startEmojiAnalisis()
}
