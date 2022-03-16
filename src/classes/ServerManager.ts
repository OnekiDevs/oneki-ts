import { Collection, Guild } from "discord.js";
import { Server, Client } from "../utils/classes.js";

export class ServerManager extends Collection<string, Server> {
    client: Client;

    constructor(client: Client) {
        super();
        this.client = client;
    }
    
    initialize(guild?: Guild) {
        return Promise.all(this.client.guilds?.cache.map((guild: Guild) => this.set(guild.id, new Server(guild))));
    }
}
