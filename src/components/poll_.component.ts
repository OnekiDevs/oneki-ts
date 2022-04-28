import { ButtonInteraction, TextChannel, EmbedBuilder } from 'discord.js'
import { Component, Client, PollDatabaseModel } from '../utils/classes.js'
import { pollEmojis as emojis, filledBar, Translator } from '../utils/utils.js'

export default class Activitie extends Component {
    constructor(client: Client) {
        super(client, /poll_.{8}_option_\d{1,2}/i)
    }

    async button(interaction: ButtonInteraction<'cached'>) {
        const [, id, , option] = interaction.customId.split(/_/gi)
        const snap = await this.client.db.collection('polls').doc(id).get()
        if (!snap?.exists) return interaction.deferUpdate()
        await interaction.deferReply({ ephemeral: true })
        const data = snap.data() as PollDatabaseModel
        const translate = Translator(interaction)
        //reviso si puede votar
        if (!data.multiple_choices && data.block_choices && data.options.map((o) => o.votes.includes(interaction.user.id)).filter((i) => i).length > 0) return interaction.editReply('Ya has votado')
        //actualizo votos
        data.options = data.options.map((o) => {
            const to = {
                ...o,
                votes: o.votes.filter((v) => data.multiple_choices || v !== interaction.user.id),
            }
            if (to.name === `option_${option}`) to.votes.push(interaction.user.id)
            return to
        });
        //actualizo base de datos
        (interaction.client as Client).db
            ?.collection('polls')
            .doc(id)
            .update(data)
            .catch(() => this.client.db.collection('polls').doc(id).set(data))
        let votes = 0
        await Promise.all(data.options.map((o) => (votes += o.votes.length)))
        //obtengo embed
        const embed = new EmbedBuilder(interaction.message.embeds[0]?.data)
        //modifico embed
        embed.setFooter({
            text: translate('poll_btn.embed_footer', {
                id, votes, bot: interaction.client.user?.username, version: this.client.version
            }),
            iconURL: interaction.client.user?.avatarURL() ?? '',
        })
        if (data.show_results) {
            embed.setFields(
                await Promise.all(
                    data.options.map((o, i) => ({
                        name: translate('poll_btn.option', { emoji: emojis[i], number: i + 1, value: o.value }),
                        value: `\`${filledBar((o.votes.length / votes) * 100)}\` ${Math.round((o.votes.length / votes) * 100)}%`,
                        inline: false,
                    })),
                ),
            )
        }
        //actualizo embed
        (interaction.client.channels.cache.get(interaction.channelId) as TextChannel)?.messages
            .fetch(interaction.message.id)
            .then((msg) => {
                msg.edit({
                    embeds: [embed],
                })
            })
            .catch((e) => e)
        interaction.editReply(translate('poll_btn.reply'))
        return
    }
}