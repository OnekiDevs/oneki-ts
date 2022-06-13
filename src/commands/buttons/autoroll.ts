import { ButtonInteraction } from 'discord.js'
import { Translator } from '../../utils/utils'

export function aor(interaction: ButtonInteraction<'cached'>) {
    const [, , , rollId] = interaction.customId.split(/_/gi)
    const translate = Translator(interaction)
    if (interaction.member.roles.cache.has(rollId)) {
        interaction.member.roles.remove(rollId)
        interaction.reply({
            content: translate('config_cmd.autoroles.remove'),
            ephemeral: true
        })
    } else {
        interaction.member.roles.add(rollId)
        interaction.reply({
            content: translate('config_cmd.autoroles.add'),
            ephemeral: true
        })
    }
}
