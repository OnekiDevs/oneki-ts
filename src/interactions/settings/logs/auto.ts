import {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    MessageActionRowComponentBuilder,
    ButtonInteraction
} from 'discord.js'

export async function buttonInteraction(interaction: ButtonInteraction<'cached'>) {
    // check if is the same user
    if (interaction.message.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()
    // yes and no buttons
    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
        new ButtonBuilder().setCustomId('settings_autologs_y').setLabel('Si').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('settings_autologs_n').setLabel('No').setStyle(ButtonStyle.Danger)
    )
    // response
    interaction.reply({
        components: [row],
        content:
            'A continuacion se le pedira el ID de una categoria donde creara canales correspondientes para los logs.\n¿Desea continuar?'
    })
    return setTimeout(() => interaction.deleteReply().catch(() => null), 60_000) // timeout
}
