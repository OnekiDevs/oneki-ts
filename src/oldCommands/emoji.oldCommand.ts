import { Message, MessageEmbed } from "discord.js";
import { OldCommand, Client } from "../utils/classes";

export default class Help extends OldCommand {
    constructor(client: Client) {
        super({
            name: "emoji",
            description: "Get the emoji as a URL",
            alias: ["emote", "emogi"],
        });
    }

    async run(msg: Message, args?: string[]) {
        const emojiString = (msg.content.match(/<a?:(.+):\d{18}>/) ?? args)?.[0];
        const emojiId = (emojiString ?? "").replace(/<a?:(.+):/, "").replace(/>/, "");
        if (args && args[0] && /\d{18}/.test(emojiId)) {
            fetch(`https://cdn.discordapp.com/emojis/${emojiId}.gif`).then((a) => {
                if (a.status != 200) {
                    fetch(`https://cdn.discordapp.com/emojis/${emojiId}.png`).then((e) => {
                        if (e.status != 200) msg.reply("Emoji no encontrado");
                        else
                            msg.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setColor("#ffffff")
                                        .setImage(e.url)
                                        .addField("Enlace", `[PNG](${e.url})`),
                                ],
                            });
                    });
                } else
                    msg.reply({
                        embeds: [
                            new MessageEmbed()
                                .setColor("#ffffff")
                                .setImage(a.url)
                                .addField("Enlace", `[GIF](${a.url})`),
                        ],
                    });
            });
        } else msg.reply("necesitas mencionar un emoji o id");
    }
}
