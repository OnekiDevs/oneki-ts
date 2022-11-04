import { SelectMenuInteraction } from 'discord.js'
import client from '../../client.js'
import { _components, _embeds } from '../settings.js'

export async function selectMenuInteraction(interaction: SelectMenuInteraction<'cached'>) {
    const server = client.getServer(interaction.guild)
    // chech if is the same user
    if (interaction.message.embeds[0].author?.name !== interaction.member.displayName) return interaction.deferUpdate()
    // get the page and edit the embed
    const [pag] = interaction.values as ['logs' | 'prefix']
    interaction.message.edit({
        embeds: [_embeds[pag](server, interaction.member)],
        components: _components[pag](server)
    })
    // response
    return interaction.deferUpdate()
}
