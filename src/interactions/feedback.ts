import {
    ChatInputCommandInteraction,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder,
    ActionRowBuilder,
    ModalSubmitInteraction
} from 'discord.js'
import { Translator } from 'offdjs'
import feedback from '../cache/feedback.js'
import { EmbedBuilder, TextChannel } from 'discord.js'
import client from '../client.js'

export async function chatInputCommandInteraction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
    const translate = Translator(interaction)
    const label = interaction.options.getString('label', true) as 'bug' | 'feature' | 'feedback' | 'other'
    const img = interaction.options.getAttachment('img')

    if (img) feedback.set(interaction.user.id, img)

    const modal = new ModalBuilder()
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setLabel(
                        label === 'feedback'
                            ? translate('feedback.say_feedback')
                            : translate('feedback.describe', { label })
                    )
                    .setCustomId('feedback')
                    .setPlaceholder(translate('feedback.modal_placeholder'))
                    .setMinLength(10)
                    .setMaxLength(4000)
                    .setStyle(TextInputStyle.Paragraph)
            )
        )
        .setCustomId(`feedback:${label}`)
        .setTitle(label.toUpperCase())

    interaction.showModal(modal)
}

export async function modalSubmitInteraction(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
    const translate = Translator(interaction)
    const [, label] = interaction.customId.split(':') as ['feedback', 'bug' | 'feature' | 'feedback' | 'other']
    const text = interaction.fields.getTextInputValue('feedback')
    const img = feedback.get(interaction.user.id)

    const embed = new EmbedBuilder()
        .setTitle('New ' + label)
        .setDescription(text)
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.member.displayAvatarURL() })
        .setTimestamp()

    if (img) embed.setImage(img.url)
    feedback.delete(interaction.user.id)

    const channel = (await interaction.client.channels.fetch(client.constants.issuesChannel)) as TextChannel
    channel.send({ embeds: [embed] })

    interaction.reply(translate('feedback.thanks'))
}
