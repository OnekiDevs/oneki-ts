/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders'
import { APIEmbed, ApplicationCommandOptionType } from 'discord-api-types/v10'
import {
    Attachment,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    PermissionsBitField,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import { Command } from '../utils/classes.js'
import { errorCatch } from '../utils/utils.js'

export default class Embed extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'embed',
                'es-ES': 'embed'
            },
            description: {
                'en-US': 'Create an embed',
                'es-ES': 'Crea un embed'
            },
            options: [
                {
                    type: ApplicationCommandOptionType.Attachment,
                    name: {
                        'en-US': 'image',
                        'es-ES': 'imagen'
                    },
                    description: {
                        'en-US': 'Set an image for the embed',
                        'es-ES': 'Establece una imagen para el embed'
                    }
                }
            ],
            permissions: new PermissionsBitField([
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.EmbedLinks
            ])
        })
    }

    components = [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
            new ButtonBuilder().setLabel('Edit Information').setStyle(ButtonStyle.Primary).setCustomId(`embed_edit`),
            new ButtonBuilder().setLabel('Add Field').setStyle(ButtonStyle.Primary).setCustomId(`embed_field`),
            new ButtonBuilder().setLabel('Edit Fields').setStyle(ButtonStyle.Primary).setCustomId(`embed_edit_field`)
        ])
    ]

    @errorCatch(import.meta.url)
    async interacion(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        let image: Attachment | string | null = interaction.options.getAttachment('image')
        const extencion = image?.url.split('.').pop() ?? ''
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extencion)) image = image?.url as string
        else image = null

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('You can edit the information with the **Edit** button')
                    .setTitle('New Embed')
                    .setImage(image)
            ],
            components: this.components
        })
    }

    @errorCatch(import.meta.url)
    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        if (interaction.message.interaction?.user.id !== interaction.user.id) return interaction.deferUpdate()

        const embed = new EmbedBuilder(interaction.message.embeds[0]?.data as APIEmbed)

        if (interaction.customId === 'embed_edit') {
            const title = new ActionRowBuilder<TextInputBuilder>().addComponents([
                new TextInputBuilder()
                    .setCustomId('title')
                    .setLabel('Title')
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(embed.data.title ?? '')
                    .setRequired(false)
                    .setMaxLength(256)
            ])

            const description = new ActionRowBuilder<TextInputBuilder>().addComponents([
                new TextInputBuilder()
                    .setCustomId('description')
                    .setLabel('Description')
                    .setStyle(TextInputStyle.Short)
                    .setValue(embed.data.description ?? '')
                    .setRequired(false)
                    .setMaxLength(4000)
            ])

            const image = new ActionRowBuilder<TextInputBuilder>().addComponents([
                new TextInputBuilder()
                    .setCustomId('image')
                    .setLabel('Image')
                    .setStyle(TextInputStyle.Short)
                    .setValue(embed.data.image?.url ?? '')
                    .setRequired(false)
            ])

            interaction.showModal(
                new ModalBuilder()
                    .setCustomId(`embed_modal_edit`)
                    .setTitle('Edit Embed')
                    .addComponents([title, description, image])
            )
        } else if (interaction.customId === 'embed_field') {
            const name = new ActionRowBuilder<TextInputBuilder>().addComponents([
                new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel('Field Name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(256)
            ])

            const value = new ActionRowBuilder<TextInputBuilder>().addComponents([
                new TextInputBuilder()
                    .setCustomId('value')
                    .setLabel('Field Value')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(1024)
            ])

            const inline = new ActionRowBuilder<TextInputBuilder>().addComponents([
                new TextInputBuilder()
                    .setCustomId('inline')
                    .setLabel('Inline (true/NO)')
                    .setStyle(TextInputStyle.Short)
                    .setValue('yes')
                    .setRequired(true)
            ])

            interaction.showModal(
                new ModalBuilder()
                    .setTitle('New Field')
                    .setCustomId('embed_modal_field')
                    .addComponents([name, value, inline])
            )
        } else {
            const modal = new ModalBuilder().setTitle('Edit Fields').setCustomId('embed_modal_edit_field')

            let i = 0
            for (const field of embed.data.fields ?? []) {
                modal.addComponents([
                    new ActionRowBuilder<TextInputBuilder>().addComponents([
                        new TextInputBuilder()
                            .setCustomId('field_' + i++)
                            .setLabel(field.name)
                            .setStyle(TextInputStyle.Paragraph)
                            .setValue(field.value)
                            .setMaxLength(1024)
                            .setRequired(false)
                    ])
                ])
            }

            interaction.showModal(modal)
        }
    }

    @errorCatch(import.meta.url)
    async modal(interaction: ModalSubmitInteraction<'cached'>): Promise<any> {
        const embed = new EmbedBuilder(interaction.message?.embeds[0]?.data as APIEmbed)

        if (interaction.customId === 'embed_modal_edit') {
            const description = interaction.fields.getTextInputValue('description')
            embed.setDescription(description.length > 0 ? description : null)

            const title = interaction.fields.getTextInputValue('title')
            embed.setTitle(title.length > 0 ? title : null)

            const image = interaction.fields.getTextInputValue('image')
            embed.setImage(image.length > 0 ? image : null)

            await interaction.deferReply()
            interaction.deleteReply()

            interaction.message?.edit({
                embeds: [embed],
                components: this.components
            })
        } else if (interaction.customId === 'embed_modal_field') {
            const name = interaction.fields.getTextInputValue('name')
            const value = interaction.fields.getTextInputValue('value')
            const inline = interaction.fields.getTextInputValue('inline')

            embed.addFields([
                {
                    name,
                    value,
                    inline: ['yes', 'si', 'true'].includes(inline.toLowerCase())
                }
            ])

            await interaction.deferReply()
            interaction.deleteReply()

            interaction.message?.edit({
                embeds: [embed],
                components: this.components
            })
        } else {
            const fields = []

            let i = 0
            for (const field of embed.data.fields ?? []) {
                const value = interaction.fields.getTextInputValue('field_' + i++)

                if (value.length > 0)
                    fields.push({
                        name: field.name,
                        value,
                        inline: field.inline
                    })
            }

            embed.setFields(fields)

            await interaction.deferReply()
            interaction.deleteReply()

            interaction.message?.edit({
                embeds: [embed],
                components: this.components
            })
        }
    }
}
