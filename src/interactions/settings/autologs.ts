import {
    ButtonInteraction,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelType
} from 'discord.js'

export async function buttonInteraction(interaction: ButtonInteraction<'cached'>) {
    const [, , opt] = interaction.customId.split('_') // as ['settings', 'autologs', 'y' | 'n']
    // get the original embed
    const mr = await interaction.message.fetchReference()
    // check if is the same user
    if (mr.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()

    if (opt === 'y')
        // si si muestra el modal
        return interaction.showModal(
            new ModalBuilder()
                .setCustomId('settings_logs_auto')
                .setTitle('Category')
                .setComponents(
                    new ActionRowBuilder<TextInputBuilder>().setComponents(
                        new TextInputBuilder()
                            .setCustomId('category')
                            .setLabel('Id de la categoria')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(19)
                            .setMinLength(18)
                            .setRequired(true)
                            .setPlaceholder(
                                interaction.guild.channels?.cache
                                    .filter(c => c.type === ChannelType.GuildCategory)
                                    .random()?.id ?? '972563931233148983'
                            )
                    )
                )
        )
    else return interaction.message.delete() // si no solo borra el mensaje
}
