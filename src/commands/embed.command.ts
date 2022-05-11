/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders'
import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, MessageActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'
import { Command, Client } from '../utils/classes.js'

export default class Embed extends Command {
    constructor(client: Client) {
        super(client, {
            name: {
                'en-US': 'embed',
                'es-ES': 'embed'
            },
            description: {
                'en-US': 'Create an embed',
                'es-ES': 'Crea un embed'
            },
            buttonRegex: /^embed_.+$/,
            global: false,
        })
    }

    async interacion(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
        interaction.reply({
            embeds: [new EmbedBuilder().setDescription('Hi')],
            components: [new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
                new ButtonBuilder().setLabel('Edit').setStyle(ButtonStyle.Primary).setCustomId('embed_edit')
            ])]
        })
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const modal = new ModalBuilder()
			.setCustomId('myModal')
			.setTitle('My Modal')

		const hobbiesInput = new TextInputBuilder()
			.setCustomId('embed_modal_edit')
			.setLabel("Description")
			.setStyle(TextInputStyle.Paragraph);
            
		const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([hobbiesInput]);

        modal.addComponents([secondActionRow])

        interaction.showModal(modal)
    }
}
