import { Guild } from "discord.js";
import {Client, Server} from "../utils/clases"
export default class guildCreate {
    name: string = 'guildCreate';
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }
    
    run(guild: Guild): void {
        this.client.servers.set(guild.id, new Server(guild));
        this.client.commands.deploy(guild)
    }
}
