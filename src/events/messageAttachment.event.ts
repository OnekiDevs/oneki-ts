import { Message } from "discord.js";
import { Client } from "../utils/classes";
import { TextChannel, GuildMember, MessageEmbed } from "discord.js";
import { checkSend } from "../utils/utils";

export const name: string = "messageAttachment";

export async function run(msg: Message) {
    if (!(msg.client as Client).servers.has(msg.guild?.id ?? "")) return;
    const server = (msg.client as Client).servers.get(msg.guild?.id ?? "");
    if (!server?.logsChannels.messageDelete) return;
    const channel: TextChannel = msg.client.channels.cache.get(server.logsChannels.messageDelete) as TextChannel;
    if (channel && checkSend(channel, msg.guild?.me as GuildMember)) {
        channel.send({
            files: msg.attachments.map((attachment) => attachment),
            embeds: [
                new MessageEmbed()
                    .setTitle(`attachments send by ${msg.member?.displayName}`)
                    .setThumbnail(msg.member?.displayAvatarURL() as string)
                    .addField("Canal", `${msg.channel} | ${(msg.channel as TextChannel).name ?? ""}`)
                    .setURL(msg.url),
            ],
            content: msg.author.id,
        });
    } else {
        if (msg.guild?.publicUpdatesChannel && checkSend(msg.guild?.publicUpdatesChannel, msg.guild.me as GuildMember))
            msg.guild?.publicUpdatesChannel.send({
                content: `El canal <#${server.logsChannels.messageDelete}> esta configurado para mostrar logs de Attachments, sin embargo no tengo acceso a ese canal o no existe.\nSe eliminara de la configuracion, para volver a activarlo debe ejecutar el comando **/config log message_attachment** nuevamente`,
            });
        else {
            //TODO terminar
            //mandar una aviso al servidor
        }
        server.removeMessageDeleteLog();
    }
}
