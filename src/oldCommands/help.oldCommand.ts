import { Message, MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { OldCommand, Client, oldCommandData } from "../utils/classes";

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: "help",
            description: "show command help",
            alias: ["commands", "command", "comando", "commandos"],
        });
    }

    async run(msg: Message, args?: string[]) {
        const embed = new MessageEmbed();
        let general = false;
        const server = (msg.client as Client).servers.get(msg.guildId as string);
        if (args?.length) {
            const req = await fetch(`https://oneki.herokuapp.com/api/lang/${server?.lang}/cmd/?command=${args[0]}`);
            if (!req.ok) general = true;
            else {
                const res = (await req.json()) as oldCommandData;
                embed.setTitle(`Command ${res.name}`);
                embed.setDescription(`\`<>\` Means optional\n\`[]\` Means mandatory\n${res.description}`);
                embed.addField("Alias:", `\`${res.alias.join("` `")}\``, true);
                embed.addField("Use:", `\`\`\`\n${res.type == "slash" ? "/" : server?.getPrefixes(true)[0] ?? server?.prefixies[0]}${res.use}\n\`\`\``, true);
                embed.addField("Example:", `\`\`\`\n${res.type == "slash" ? "/" : server?.getPrefixes(true)[0] ?? server?.prefixies[0]}${res.example}\n\`\`\``, true);
                if (res.user_permisions.length > 0) embed.addField("Permissions required:", `\`${res.user_permisions.join("` `")}\``, true);
                embed.setFooter({
                    text: `${msg.client.user?.username} Bot v${(msg.client as Client).version}`,
                    iconURL: msg.client.user?.avatarURL() ?? "",
                });
                embed.setThumbnail(msg.client.user?.avatarURL()??'');
                return msg.reply({
                    embeds: [embed],
                });
            }
        } else general = true;
        if (general) {
            //TODO terminar
            fetch(`https://oneki.herokuapp.com/api/lang/${server?.lang}/cmd/categories`)
                .then((req) => req.json())
                .then((res) => {
                    fetch(`https://oneki.herokuapp.com/api/lang/${server?.lang}/cmd/${(res as string[])[0]}`)
                        .then((req) => req.json())
                        .then(async (cmds) => {
                            embed.setTitle(`${msg.client.user?.username} Bot command list`);
                            embed.setDescription("Category: Entertainment\n`<>` Means optional\n`[]` Means mandatory");
                            await Promise.all(
                                (cmds as oldCommandData[]).map((cmd) => {
                                    embed.addField(
                                        cmd.name,
                                        `${cmd.description}\n**Alias:** ${cmd.alias.length > 0 ? "`" + cmd.alias.join("` `") + "`" : "none"}\n**Use:** \`${
                                            cmd.type == "command" ? server?.getPrefixes(true)[0] ?? server?.prefixies[0] : "/"
                                        }${cmd.use}\``,
                                        true,
                                    );
                                }),
                            );
                            embed.setFooter({
                                text: `${msg.client.user?.username} Bot v${(msg.client as Client).version}`,
                                iconURL: msg.client.user?.avatarURL() ?? "",
                            });
                            embed.setThumbnail(msg.client.user?.avatarURL()??'');
                            return msg.reply({
                                embeds: [embed],
                            });
                        });
                });
        }
        return;
    }
}
