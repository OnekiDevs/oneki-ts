import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import client from '../../client.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
    if (!(interaction.replied || interaction.deferred)) interaction.deferReply()

    const server = client.getServer(interaction.guild)
    const embeds = [new EmbedBuilder().setDescription('Emojis uses')]
    let j = 0,
        t = '',
        i = 0,
        updateDB = false

    // filtro de emojis vigentes
    const es = []
    for (const key in server.emojiStatistics) {
        const emoji = await interaction.guild.emojis
            .fetch(key)
            .then(e => e)
            .catch(() => null)

        if (emoji)
            es.push({
                name: emoji.toString(),
                uses: server.emojiStatistics[key]
            })
        else {
            updateDB = true
            delete server.emojiStatistics[key]
        }
    }

    // sort y recorrido
    for (const em of es.sort((a, b) => b.uses - a.uses)) {
        t += `${em.name} --- \`${em.uses}\`\n`

        if (++i == 6) {
            embeds[j].addFields([{ name: 'Emojis', value: t, inline: true }])
            i = 0
            t = ''
        }

        if (embeds[j].data.fields?.length == 25) {
            embeds.push(new EmbedBuilder().setDescription('Emojis uses'))
            j++
        }
    }

    // eliminacion de emojis que no estan vigentes
    if (updateDB)
        server.db
            .update({ emoji_statistics: server.emojiStatistics })
            .catch(() => server.db.set({ emoji_statistics: server.emojiStatistics }))

    // si no hay emojis suficientes para mostrar
    if (t && !embeds[0].data.fields)
        embeds[0].addFields([
            {
                name: 'Emojis',
                value: t,
                inline: true
            }
        ])
    else if (!t) embeds[0].setDescription('Nada de momento')

    // enviar
    interaction.editReply({ embeds })
}
