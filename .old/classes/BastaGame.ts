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
        // TODO: implement game logic
        // generate random letter
        // show letter
        // wait for reactions
        // timeout 10s for others players
        // consensus?
        // apply points
        // continue question
        // if end show points
    }

    generateRandomLetter() {
        return 'a'
    }
}
