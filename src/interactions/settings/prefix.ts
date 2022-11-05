import {
    ModalBuilder,
    ActionRowBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
    ButtonInteraction
} from 'discord.js'
import { capitalize } from 'offdjs'
import { _embeds } from '../settings.js'
import { _components } from '../settings'
import { getServer } from '../../cache/servers.js'

export async function buttonInteraction(interaction: ButtonInteraction<'cached'>) {
    const [, , opt] = interaction.customId.split('_') // as ['settings', 'prefix', 'add' | 'remove' | 'set']
    // check if is the same user
    if (interaction.message.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()
    // show modal
    return interaction.showModal(
        new ModalBuilder()
            .setCustomId('settings_prefix_' + opt)
            .setTitle(capitalize(opt) + ' Prefix')
            .setComponents(
                new ActionRowBuilder<TextInputBuilder>().setComponents(
                    new TextInputBuilder()
                        .setCustomId('prefix')
                        .setLabel('Prefix')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(15)
                        .setRequired(true)
                        .setPlaceholder('>')
                )
            )
    )
}

export async function modalSubmitInteraction(interaction: ModalSubmitInteraction<'cached'>) {
    const [, pag, opt] = interaction.customId.split('_') as ['settings', 'prefix', 'add' | 'remove' | 'set']
    const server = getServer(interaction.guild)
    // check if is the same user
    if (interaction.message?.embeds[0].author?.name !== interaction.member.displayName)
        return interaction.reply({
            content: 'Este modal no es para ti',
            ephemeral: true
        })

    const prefix = interaction.fields.getTextInputValue('prefix') as string
    // add, remove or set prefix
    if (opt === 'add') server.addPrefix(prefix)
    else if (opt === 'remove') server.removePrefix(prefix)
    else server.setPrefix(prefix)
    // edit the embed
    interaction.message?.edit({
        embeds: [_embeds[pag](server, interaction.member)],
        components: _components[pag](server)
    })

    await interaction.deferReply()
    return interaction.deleteReply()
}
