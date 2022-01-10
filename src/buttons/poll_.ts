import { ButtonInteraction, TextChannel, MessageEmbed } from "discord.js";
import { Button, Client, PollDatabaseModel } from "../utils/classes";
import { pollEmojis as emojis, filledBar } from "../utils/utils";

export default class Activitie extends Button {
    constructor() {
        super({
            name: "poll_",
            regex: /poll_.{8}_option_\d{1,2}+/gi,
        });
    }

    async run(interaction: ButtonInteraction) {
        const [, id, , option] = interaction.customId.split(/_/gi);
        const snap = await (interaction.client as Client).db?.collection("polls").doc(id).get();
        if (!snap?.exists) return interaction.deferUpdate();
        await interaction.deferReply({ ephemeral: true });
        let data = snap.data() as PollDatabaseModel;
        //reviso si puede votar
        if (!data.multiple_choices && data.block_choices && data.options.map((o) => o.votes.includes(interaction.user.id)).filter((i) => i).length > 0) return interaction.editReply("Ya has votado");
        //actualizo votos
        data.options = data.options.map((o) => {
            let to = {
                ...o,
                votes: o.votes.filter((v) => data.multiple_choices || v !== interaction.user.id),
            };
            if (to.name === `option_${option}`) to.votes.push(interaction.user.id);
            return to;
        });
        //actualizo base de datos
        (interaction.client as Client).db
            ?.collection("polls")
            .doc(id)
            .update(data)
            .catch((e) => (interaction.client as Client).db?.collection("polls").doc(id).set(data));
        let votesCount = 0;
        await Promise.all(data.options.map((o) => (votesCount += o.votes.length)));
        //obtengo embed
        const embed = new MessageEmbed(interaction.message.embeds[0]);
        //modifico embed
        embed.setFooter({
            text: `Poll ID : ${id} | ${votesCount} votes | ${interaction.client.user?.username} Bot v${(interaction.client as Client).version}`,
            iconURL: interaction.client.user?.avatarURL() ?? "",
        });
        if (data.show_results) {
            embed.setFields(
                await Promise.all(
                    data.options.map((o, i) => ({
                        name: `${emojis[i]} Opcion ${i + 1} ${o.value}`,
                        value: `\`${filledBar((o.votes.length / votesCount) * 100)}\` ${Math.round((o.votes.length / votesCount) * 100)}%`,
                        inline: false,
                    })),
                ),
            );
        }
        //actualizo embed
        (interaction.client.channels.cache.get(interaction.channelId) as TextChannel)?.messages
            .fetch(interaction.message.id)
            .then((msg) => {
                msg.edit({
                    embeds: [embed],
                });
            })
            .catch((e) => e);
        interaction.editReply("Voto enviado");
    }
}
