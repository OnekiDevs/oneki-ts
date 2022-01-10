import { ApplicationCommandDataResolvable, CommandInteraction, Guild, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { Command, Client, CommandType } from "../utils/classes";
import { checkSend } from "../utils/utils";

export default class Suggest extends Command {
    constructor(client: Client) {
        super(client, {
            name: "suggest",
            description: "Make a suggestion",
            defaultPermission: true,
            type: CommandType.guild,
        });
    }

    async getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        const server = this.client.servers.get(guild?.id as string);
        const command = this.baseCommand;
        command.addStringOption((option) => option.setName("suggestion").setDescription("Suggest to send").setRequired(true));
        if (server && server.suggestChannels.length > 0) {
            const channels = server.suggestChannels.map((i) => [i.alias ?? "predetermined", i.channel]);
            command.addStringOption((option) =>
                option
                    .setName("channel")
                    .setDescription("channel to send the suggestion")
                    .addChoices(channels as [name: string, value: string][]),
            );
        }
        return command.toJSON() as ApplicationCommandDataResolvable;
    }

    run(interaction: CommandInteraction): any {
        const server = this.client.servers.get(interaction.guildId as string);
        if (!server || server.suggestChannels.length === 0) {
            interaction.reply({
                content: "Este servidor no tiene un canal de sugerencias establecido",
                ephemeral: true,
            });
            const guild = interaction.guild ?? this.client.guilds.cache.get(interaction.guildId as string);
            return (
                guild?.name,
                guild?.commands.cache.map((c) => {
                    if (c.name == interaction.commandName) c.delete();
                })
            );
        }
        const channelId = interaction.options.getString("channel");
        const sug = interaction.options.getString("suggestion");
        const channel = this.client.channels.cache.get(channelId as string) as TextChannel;
        if (channel && checkSend(channel, interaction.guild?.me as GuildMember)) {
            server.lastSuggestId += 1;
            const embed = new MessageEmbed()
                .setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
                .setTitle(`Sugerencia #${server.lastSuggestId}`)
                .setColor(16313844)
                .setDescription(sug as string)
                .setFooter(`${this.client.user?.username} Bot v${this.client.version}`, this.client.user?.avatarURL() ?? "")
                .setTimestamp();
            channel
                .send({
                    embeds: [embed],
                })
                .then((msg) =>{
                    msg.startThread({
                        name: `Sugerencia #${server.lastSuggestId}`,
                    })
                    server.db?.collection('suggests').doc(`suggest_${server.lastSuggestId}`).set({ 
                        author: interaction.user.id, 
                        channel: msg.channel.id,
                        suggest: sug
                    })
                }
                );
            return interaction.reply({ content: "Sugerencia Enviada", ephemeral: true });
        } else if (checkSend(channel, interaction.guild?.me as GuildMember)) {
            return interaction.reply({
                content: `Error, El canal <#${channelId}> esta establecido para sugerencia pero no tengo permisos para acceder. <@${interaction.guild?.ownerId}>`,
                ephemeral: true,
            });
        } else if (!channelId || !channel) {
            server.removeSuggestChannel(channelId as string);
            return interaction.reply({ content: "Error, canal no encontrado", ephemeral: true });
            (interaction.client as Client).commands.get(interaction.commandName)?.deploy(interaction.guild as Guild);
            (interaction.client as Client).commands.get("config")?.deploy(interaction.guild as Guild);
        }
    }

    checkDeploy(guild?: Guild): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const server = this.client.servers.get(guild?.id as string);
            resolve((server && server.suggestChannels.length == 0) as boolean);
        });
    }
}
