import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from 'discord.js'
import { filledBar, Translator } from 'offdjs'
import client from '../../client.js'
import { PollDatabaseModel } from '../../cache/polls.js'
import { pollEmojis as emojis } from '../../utils/utils.js'
import db from '../../cache/db.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>) {
    const translate = Translator(interaction)
    await interaction.deferReply({ ephemeral: true })

    const id = interaction.options.getString('id') as string

    const snap = await db.collection('polls').doc(id).get()

    if (snap.exists) {
        const data = snap.data() as PollDatabaseModel

        await db
            .collection('finalized-polls')
            .doc(id)
            .set(data)
            .catch(() => '')

        snap.ref.delete()

        const chennel = client.channels.cache.get(data.channel) as TextChannel
        chennel?.messages.fetch(data.message).then(async msg => {
            await msg.edit({
                components: []
            })
            if (!data.show_results) {
                const embed = new EmbedBuilder(msg.embeds[0]?.data)
                let votesCount = 0
                await Promise.all(data.options!.map(o => (votesCount += o.votes.length)))
                embed.setFields(
                    await Promise.all(
                        data.options!.map((o, i) => ({
                            name: `${emojis[i]} Opcion ${i + 1} ${o.title}`,
                            value: `\`${filledBar((o.votes.length / votesCount) * 100)}\` ${Math.round(
                                (o.votes.length / votesCount) * 100
                            )}%`,
                            inline: false
                        }))
                    )
                )
                msg.edit({
                    embeds: [embed]
                })
            }
        })
        interaction.editReply(translate('poll_cmd.finalize'))
    } else {
        await interaction.reply({
            content: translate('poll_cmd.not_found'),
            ephemeral: true
        })
    }
}
