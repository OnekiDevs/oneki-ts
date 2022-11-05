import Server from '../classes/Server.js'
import { Collection, Guild } from 'discord.js'

const servers = new Collection<string, Server>()
export default servers

/**
 * Get a Server Class
 * @param {Guild} guild - guild to refer. it is necessary to create the class in case the server doesn't exist, if you don't have the Guild, try client.servers.ger(guild_id)
 * @returns a Server Class
 */
export function getServer(guild: Guild): Server {
    return servers.get(guild.id) ?? newServer(guild)
}

/**
 * Return a new Server cached
 * @param {Guild} guild
 * @param {GuildDataBaseModel} data
 * @returns {Server}
 */
export function newServer(guild: Guild): Server {
    const server = new Server(guild)
    servers.set(guild.id, server)
    return server
}
