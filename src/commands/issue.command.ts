import {
    ChatInputCommandInteraction,
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
    Attachment,
    ModalSubmitInteraction,
    TextChannel
} from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'
import { EmbedBuilder } from 'discord.js'

export default class Feedback extends Command {
    cache = new Collection<string, Attachment>()
    constructor() {
        super({
            name: {
                'en-US': 'feedback',
                'es-ES': 'feedback'
            },
            description: {
                'en-US': 'Send feedback to the bot team developer',
                'es-ES': 'Envía un feedback al equipo de desarrolladores del bot'
            },
            options: [
                {
                    name: {
                        'en-US': 'label',
                        'es-ES': 'etiqueta'
                    },
                    description: {
                        'en-US': 'select a label',
                        'es-ES': 'selecciona una etiqueta'
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: {
                                'en-US': 'Bug',
                                'es-ES': 'Bug'
                            },
                            value: 'bug'
                        },
                        {
                            name: {
                                'en-US': 'Feature',
                                'es-ES': 'Sugerencia'
                            },
                            value: 'feature'
                        },
                        {
                            name: {
                                'en-US': 'feedback',
                                'es-ES': 'feedback'
                            },
                            value: 'feedback'
                        },
                        {
                            name: {
                                'en-US': 'Other',
                                'es-ES': 'Otro'
                            },
                            value: 'other'
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'img',
                        'es-ES': 'img'
                    },
                    description: {
                        'en-US': 'add a image if is possible',
                        'es-ES': 'añade una imagen si es posible'
                    },
                    type: ApplicationCommandOptionType.Attachment
                }
            ]
        })
    }

    @errorCatch(import.meta.url)
    async interaction(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        // const translate = Translator(interaction)
        const label = interaction.options.getString('label', true) as 'bug' | 'feature' | 'feedback' | 'other'
        const img = interaction.options.getAttachment('img')

        if (img) this.cache.set(interaction.user.id, img)

        const modal = new ModalBuilder()
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setLabel(label === 'feedback' ? 'Say your feedback' : `Describe the ${label}`)
                        .setCustomId('feedback')
                        .setPlaceholder('Add the chinese translation')
                        .setMinLength(10)
                        .setMaxLength(4000)
                        .setStyle(TextInputStyle.Paragraph)
                )
            )
            .setCustomId(`feedback:${label}`)
            .setTitle(label.toUpperCase())

        interaction.showModal(modal)
    }

    @errorCatch(import.meta.url)
    async modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
        const [, label] = interaction.customId.split(':') as ['feedback', 'bug' | 'feature' | 'feedback' | 'other']
        const text = interaction.fields.getTextInputValue('feedback')
        const img = this.cache.get(interaction.user.id)

        const embed = new EmbedBuilder()
            .setTitle('New ' + label)
            .setDescription(text)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.member.displayAvatarURL() })
            .setTimestamp()

        if (img) embed.setImage(img.url)
        this.cache.delete(interaction.user.id)

        const channel = (await interaction.client.channels.fetch('CHANNEL_ID')) as TextChannel
        channel.send({ embeds: [embed] })

        interaction.reply('Thanks for your feedback!')
    }
}
