import { Guild, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { Client, Server } from "../utils/classes";
import { checkSend } from "../utils/utils";

export const name: string = "guildCreate";

export async function run(client: Client, guild: Guild) {
    if (!client.servers.has(guild.id)) client.servers.set(guild.id, new Server(guild));
    console.log("\x1b[34m%s\x1b[0m", `Nuevo Servidor Desplegado!! ${guild.name} (${guild.id})`);
    client.commands.deploy(guild).then(() => console.log("\x1b[32m%s\x1b[0m", "Comandos Desplegados para " + guild.name));
    const channel = client.channels.cache.get(client.constants.newServerLogChannel ?? "") as TextChannel;
    if (channel && checkSend(channel, guild.me as GuildMember)) {
        const owner = await client.users.fetch(guild.ownerId);
        const embed = new MessageEmbed()
            .setThumbnail(guild.iconURL() ?? "")
            .setTitle("Me añadieron en un Nuevo Servidor")
            .setDescription(`ahora estoy en ${client.guilds.cache.size} servidores`)
            .addField("Servidor", `${guild.name}`, true)
            .addField("ID", `\`${guild.id}\``, true)
            .addField("Roles", `\`${guild.roles.cache.size}\``, true)
            .addField("Miembros", `\`${guild.memberCount}\``, true)
            .addField("Dueño", `\`${owner.username}#${owner.discriminator}\``, true)
            .setTimestamp()
            .setColor("RANDOM")
            .setFooter(`${client.user?.username} Bot v${client.version}`)
            .setImage(guild.bannerURL() ?? "");
        channel.send({
            embeds: [embed],
        });
    }
}
