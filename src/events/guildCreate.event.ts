import { Guild, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import {Client, Server} from "../utils/clases"
import { checkSend } from "../utils/utils";
export default class guildCreate {
    name: string = 'guildCreate';
    client: Client;

    constructor(client: Client) {
        this.client = client;
        this.client.on(this.name, async (guild: Guild) => {      
            if (!this.client.servers.has(guild.id)) this.client.servers.set(guild.id, new Server(guild));
            console.log("\x1b[34m%s\x1b[0m", `Nuevo Servidor Desplegado!! ${guild.name} (${guild.id})`);
            this.client.commands.deploy(guild).then(() => console.log("\x1b[32m%s\x1b[0m", "Comandos Desplegados para "+guild.name))
            const channel = this.client.channels.cache.get(this.client.constants.newServerLogChannel??'') as TextChannel
            if (channel && checkSend(channel, guild.me as GuildMember)) {
                const owner = await this.client.users.fetch(guild.ownerId)
                const embed = new MessageEmbed()
                    .setThumbnail(guild.iconURL()??'')
                    .setTitle("Me añadieron en un Nuevo Servidor")
                    .setDescription(`ahora estoy en ${this.client.guilds.cache.size} servidores`)
                    .addField("Servidor", `${guild.name}`, true)
                    .addField("ID", `\`${guild.id}\``, true)
                    .addField("Roles", `\`${guild.roles.cache.size}\``, true)
                    .addField("Miembros", `\`${guild.memberCount}\``, true)
                    .addField("Dueño", `\`${owner.username}#${owner.discriminator}\``, true)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${this.client.user?.username} Bot v${this.client.version}`)
                    .setImage(guild.bannerURL()??'');
                channel.send({
                    embeds: [embed]
                })
            }
        })
    }
}
