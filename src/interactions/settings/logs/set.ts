import { ButtonInteraction } from 'discord.js'
import { _logsMenu } from '../logs.js'

export async function buttonInteraction(interaction: ButtonInteraction<'cached'>) {
    // check if is the same user
    if (interaction.message.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()
    // menu of logs
    const row = _logsMenu('set')
    // response
    interaction.reply({
        components: [row],
        content:
            'Seleccione uno o varios logs a establecer y a continuacion se le pedira el ID de una canal de texto donde configurara los correspondientes logs'
    })
    return setTimeout(() => interaction.deleteReply().catch(() => null), 60_000) // timeout
}
