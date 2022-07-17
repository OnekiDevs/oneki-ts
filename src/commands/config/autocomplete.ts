import { AutocompleteInteraction } from 'discord.js'
import client from '../../client.js'

export function group(interacion: AutocompleteInteraction<'cached'>) {
    const server = client.getServer(interacion.guild)
    console.log(server.autoroles, server.autoroles.size)

    if (!server.autoroles.size) return interacion.respond([])
    const r = [...server.autoroles.keys()].map(v => ({
        name: v,
        value: v
    }))
    return interacion.respond(r)
}
