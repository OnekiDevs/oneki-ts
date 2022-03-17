import { Collection, Guild } from 'discord.js'
import { Server, Client } from '../utils/classes.js'

export class ServerManager extends Collection<string, Server> {
    client: Client

    constructor(client: Client) {
        super()
        this.client = client
    }
    
    initialize(guild?: Guild) {
        return Promise.all(this.client.guilds?.cache.map((guild: Guild) => this.set(guild.id, new Server(guild))))
    }

    /*
    get(key: string): Server {
        let s = super.get(key)
        if (s) return s
        const guild = this.client.guilds.cache.get(key)!
        s = new Server(guild)
        this.set(guild.id, s)
        return s
    }
    */
}
