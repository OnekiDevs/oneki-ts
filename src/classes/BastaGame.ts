import { Message, EmbedBuilder } from 'discord.js'

export default class BastaGame {
    players = new Set<string>()
    message: Message
    embed: EmbedBuilder
    constructor(message: Message) {
        this.message = message
        this.embed = EmbedBuilder.from(message.embeds[0].data)
    }

    start() {
        this.message.edit({ content: 'coming soon', embeds: [], components: [] })
    }
}
