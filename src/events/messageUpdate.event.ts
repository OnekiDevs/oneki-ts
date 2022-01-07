import { Client } from "../utils/classes";
import { MessageEmbed, Message, TextChannel, GuildMember } from "discord.js";
import { checkSend } from "../utils/utils";

export const name: string = "messageUpdate";

export function run(old: Message, msg: Message) {
    if (msg.author.bot) return;
    if (!(msg.client as Client).servers.has(msg.guild?.id ?? "")) return;
    const server = (msg.client as Client).servers.get(msg.guild?.id ?? "");
    if (!server?.logsChannels.messageUpdate) return;
    const channel: TextChannel = msg.client.channels.cache.get(server.logsChannels.messageUpdate) as TextChannel;
    if (channel && checkSend(channel, msg.guild?.me as GuildMember)) {
        const embed = new MessageEmbed();
        embed.setTitle("Mensaje Editado"); //LANG:
        embed.setURL(msg.url);
        embed.setColor("RANDOM"); //FEATURE: server.logsColors
        embed.setAuthor({
            name: msg.author.username,
            iconURL: msg.author.displayAvatarURL(),
        });
        embed.addField("Editado en:", msg.channel.toString(), true); //LANG:
        embed.setTimestamp();
        embed.setThumbnail(msg.author.displayAvatarURL({ dynamic: true }));
        embed.addField("Escrito el:", `<t:${Math.round(msg.createdTimestamp / 1000)}>`, true); //Lang:
        embed.addField("Editado el:", `<t:${Math.round(Date.now() / 1000)}>`, true); //LANG:
        if (old.content) embed.addField("Antes", "```\n" + old.content + "\n```", false); //LANG:
        if (msg.content) embed.addField("Despues", "```\n" + msg.content + "\n```", false); //LANG:
        embed.setFooter({
            text: `${msg.client.user?.username} Bot v${(msg.client as Client).version}`,
            iconURL: msg.client.user?.avatarURL() ?? "",
        });
        channel.send({ embeds: [embed] });
    } else {
        //TODO terminar
        //desconfigurar del cliente y bd
        //mandar una aviso al servidor
    }
}
