import { AutocompleteInteraction } from 'discord.js'
import client from '../../client.js'

export function group(interacion: AutocompleteInteraction<'cached'>) {
    const server = getServer(interacion.guild)

    if (!server.autoroles.size) return interacion.respond([])
    const r = [...server.autoroles.keys()].map(v => ({
        name: v,
        value: v
    }))
    return interacion.respond(r)
}

export function prefix(interaction: AutocompleteInteraction<'cached'>) {
    const server = getServer(interaction.guild)

    return interaction.respond(
        server.getPrefixes(true).map(p => ({
            name: p,
            value: p
        }))
    )
}

export function channel(interaction: AutocompleteInteraction<'cached'>) {
    const server = getServer(interaction.guild)

    return interaction.respond(
        server.suggestChannels.map(c => ({
            name: c.default ? 'default' : c.alias!,
            value: c.channel
        }))
    )
}
