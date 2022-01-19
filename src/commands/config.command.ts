import {
    ApplicationCommandDataResolvable,
    CommandInteraction,
    Guild,
    Interaction,
    Permissions,
    TextChannel,
} from "discord.js";
import { Command, Client, CommandType, Server, LangType } from "../utils/classes";
import { ChannelType } from "discord-api-types";
import { permissionsError } from "../utils/utils";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export default class Config extends Command {
    constructor(client: Client) {
        super(client, {
            name: "config",
            description: "config",
            defaultPermission: false,
            type: CommandType.guild,
        });
    }

    getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        const server = this.client.servers.get(guild?.id as string);
        const suggestChannelsChoices = server?.suggestChannels.map((c) => [c.default ? "default" : c.alias, c.channel]);
        const logs = ["message_update", "message_delete", "message_attachment"];
        const subcommandsLogs = logs.map((i) =>
            new SlashCommandSubcommandBuilder()
                .setName(i)
                .setDescription(`Config ${i} logs`)
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Channel where the logs are send")
                        .setRequired(true)
                        .addChannelType(ChannelType.GuildText),
                ),
        );
        return new Promise((resolve) =>
            resolve(
                this.baseCommand
                    .addSubcommandGroup((subcommandGroup) =>
                        subcommandGroup
                            .setName("set") // group
                            .setDescription("set configs")
                            .addSubcommand((subcommand) =>
                                subcommand
                                    .setName("language") // command
                                    .setDescription("Set language")
                                    .addStringOption((option) =>
                                        option
                                            .setName("lang") // option
                                            .setDescription("Language")
                                            .setRequired(true)
                                            .addChoices([
                                                ["Español", LangType.es],
                                                ["English", LangType.en],
                                            ]),
                                    ),
                            )
                            .addSubcommand((subcommand) =>
                                subcommand
                                    .setName("prefix")
                                    .setDescription("Set a new unique prefix")
                                    .addStringOption((option) =>
                                        option.setName("prefix").setDescription("New prefix").setRequired(true),
                                    ),
                            )
                            .addSubcommand((subcommand) =>
                                subcommand
                                    .setName("suggest_channel")
                                    .setDescription("Set a unique suggest channel")
                                    .addChannelOption((option) =>
                                        option
                                            .setName("channel")
                                            .setDescription("Channel were the suggest are sent")
                                            .addChannelType(ChannelType.GuildText)
                                            .setRequired(true),
                                    ),
                            ),
                    )
                    .addSubcommandGroup((subcommandGroup) =>
                        subcommandGroup
                            .setName("add")
                            .setDescription("add config")
                            .addSubcommand((subcommand) =>
                                subcommand
                                    .setName("prefix")
                                    .setDescription("Add a new pfrefix to the bot")
                                    .addStringOption((option) =>
                                        option.setName("prefix").setDescription("A new prefix").setRequired(true),
                                    ),
                            )
                            .addSubcommand((subcommand) =>
                                subcommand
                                    .setName("suggest_channel")
                                    .setDescription("Add a new suggest channel")
                                    .addChannelOption((option) =>
                                        option
                                            .setName("channel")
                                            .setDescription("Channel to suggest")
                                            .setRequired(true)
                                            .addChannelType(ChannelType.GuildText),
                                    )
                                    .addStringOption((option) =>
                                        option
                                            .setName("alias")
                                            .setDescription("Name to refired a suggest channel")
                                            .setRequired(true),
                                    )
                                    .addBooleanOption((option) =>
                                        option.setName("default").setDescription("Set a default suggestion channel"),
                                    ),
                            ),
                    )
                    .addSubcommandGroup((subcommandGroup) =>
                        subcommandGroup
                            .setName("remove")
                            .setDescription("remove config")
                            .addSubcommand((subcommand) =>
                                subcommand
                                    .setName("prefix")
                                    .setDescription("Remove prefix")
                                    .addStringOption((option) =>
                                        option
                                            .setName("prefix")
                                            .setDescription("Prefix to remove")
                                            .addChoices(
                                                server?.getPrefixes(true).map((i) => [i, i]) ?? [
                                                    [">", ">"],
                                                    ["?", "?"],
                                                ],
                                            ),
                                    ),
                            )
                            .addSubcommand((subcommand) => {
                                subcommand.setName("suggest_channel").setDescription("Remove suggestion channel");
                                if (suggestChannelsChoices && suggestChannelsChoices.length > 0)
                                    subcommand.addStringOption((option) =>
                                        option
                                            .setName("alias")
                                            .setDescription("Alias of channel to remove")
                                            .setRequired(true)
                                            .addChoices(suggestChannelsChoices as [name: string, value: string][]),
                                    );
                                return subcommand;
                            })
                            .addSubcommand((subcommand) =>
                                subcommand
                                    .setName("log")
                                    .setDescription("Remove log channel")
                                    .addStringOption((option) =>
                                        option
                                            .setName("logName")
                                            .setDescription("Log name to remove")
                                            .setRequired(true)
                                            .addChoices(logs.map((l) => [l, l])),
                                    ),
                            ),
                    )
                    .addSubcommandGroup((subcommandGroup) => {
                        subcommandGroup.setName("log").setDescription("Config the logs channels");
                        for (const scl of subcommandsLogs) {
                            subcommandGroup.addSubcommand(scl);
                        }
                        return subcommandGroup;
                    }) //TODO delete logs channel
                    .toJSON() as ApplicationCommandDataResolvable,
            ),
        );
    }

    run(interaction: CommandInteraction) {
        if (interaction.options.getSubcommandGroup() === "set") {
            if (interaction.options.getSubcommand() === "language") this.setLanguage(interaction);
            else if (interaction.options.getSubcommand() === "prefix") this.setPrefix(interaction);
            else if (interaction.options.getSubcommand() === "suggest_channel") this.setSuggestChannel(interaction);
        } else if (interaction.options.getSubcommandGroup() === "add") {
            if (interaction.options.getSubcommand() === "prefix") this.addPrefix(interaction);
            else if (interaction.options.getSubcommand() === "suggest_channel") this.addSuggestChannel(interaction);
        } else if (interaction.options.getSubcommandGroup() === "remove") {
            if (interaction.options.getSubcommand() === "prefix") this.removePrefix(interaction);
            else if (interaction.options.getSubcommand() === "suggest_channel") this.removeSuggestChannel(interaction);
            else if (interaction.options.getSubcommand() === "log") this.removeLogChannel(interaction);
        } else if (interaction.options.getSubcommandGroup() === "log") {
            if (interaction.options.getSubcommand() == "message_update") this.setLogMessageUpdate(interaction);
            if (interaction.options.getSubcommand() == "message_delete") this.setLogMessageDelete(interaction);
            if (interaction.options.getSubcommand() == "message_attachment") this.setLogMessageAttachment(interaction);
        }
    }

    setLogMessageUpdate(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
            return permissionsError(interaction, Permissions.FLAGS.MANAGE_MESSAGES);
        const channel = interaction.options.getChannel("channel") as TextChannel;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.setMessageUpdateLog(channel.id);
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { logs_channels: { message_update: channel.id } }),
            );
        interaction.reply({
            content: `Logs establecidos en ${channel}`,
        });
    }

    setLogMessageAttachment(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
            return permissionsError(interaction, Permissions.FLAGS.MANAGE_MESSAGES);
        const channel = interaction.options.getChannel("channel") as TextChannel;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.setMessageAttachmentLog(channel.id);
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { logs_channels: { message_attachment: channel.id } }),
            );
        interaction.reply({
            content: `Logs establecidos en ${channel}`,
        });
    }

    setLogMessageDelete(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
            return permissionsError(interaction, Permissions.FLAGS.MANAGE_MESSAGES);
        const channel = interaction.options.getChannel("channel") as TextChannel;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.setMessageDeleteLog(channel.id);
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { logs_channels: { message_delete: channel.id } }),
            );
        interaction.reply({
            content: `Logs establecidos en ${channel}`,
        });
    }

    setLanguage(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const lang = interaction.options.getString("lang") as LangType;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.setLang(lang);
        else if (interaction.guild)
            this.client.servers.set(interaction.guildId as string, new Server(interaction.guild, { lang }));
        interaction.reply("Lenguaje Establecido en `" + lang + "`");
        this.client.commands
            .filter((c) => c.type == CommandType.guild)
            .map((c) => c.deploy(interaction.guild as Guild));
    }

    setPrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const prefix: string = interaction.options.getString("prefix", true) as string;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.setPrefix(prefix);
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { prefixes: [prefix] }),
            );
        interaction.reply("Prefijo Establecido a `" + prefix + "`");
        this.deploy(interaction.guild as Guild);
    }

    setSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
            return permissionsError(interaction, Permissions.FLAGS.MANAGE_CHANNELS);
        const channel = interaction.options.getChannel("channel", true) as TextChannel;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.setSuggestChannel(channel);
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { suggest_channels: [{ channel: channel.id, default: true }] }),
            );
        interaction.reply("Canal " + channel + " Establecido Para Sugerencias");
        channel
            .sendTyping()
            .then(() =>
                channel.send(
                    "Este canal ahora esta establecido para las sugerencias\npara hacer una sugerencia usa **/suggest**",
                ),
            );
        this.deploy(interaction.guild as Guild);
        channel.setRateLimitPerUser(21600);
    }

    addPrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const prefix: string = interaction.options.getString("prefix", true) as string;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.addPrefix(prefix);
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { prefixes: [">", "?", prefix] }),
            );
        interaction.reply(
            "Prefijo `" +
                prefix +
                "` Agregado\nAhora el bot escucha: `'+this.client.servers.get(interaction.guildId)?.prefixies.join('`, `')+'`'",
        );
        this.deploy(interaction.guild as Guild);
    }

    addSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
            return permissionsError(interaction, Permissions.FLAGS.MANAGE_CHANNELS);
        const channel = interaction.options.getChannel("channel", true) as TextChannel;
        const alias = (interaction.options.getString("alias", true) as string).toLowerCase();
        const isDefault = interaction.options.getBoolean("default") ?? false;
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers
                .get(interaction.guildId as string)
                ?.addSuggestChannel({ channel: channel.id, default: isDefault, alias: alias });
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, {
                    suggest_channels: [{ channel: channel.id, default: isDefault, alias: alias }],
                }),
            );
        channel
            .sendTyping()
            .then(() =>
                channel.send(
                    "Este canal ahora esta establecido para las sugerencias\npara hacer una sugerencia usa **/suggest `channel:alias`**",
                ),
            );
        this.deploy(interaction.guild as Guild);
        channel.setRateLimitPerUser(21600);
    }

    removeSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
            return permissionsError(interaction, Permissions.FLAGS.MANAGE_CHANNELS);
        const channelId = interaction.options.getString("alias");
        if (!channelId) return interaction.reply("no existe ningun canal configurado");
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.removeSuggestChannel(channelId);
        else
            console.error(
                "Remove suggest channel error:\n\tdont exist server class from " +
                    interaction.guild?.name +
                    " server with id " +
                    interaction.guild?.id,
            );
        interaction.reply("Canal Removido");
        this.deploy(interaction.guild as Guild);
    }

    removePrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const prefix = interaction.options.getString("prefix", true);
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers.get(interaction.guildId as string)?.removePrefix(prefix);
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { prefixes: [prefix === ">" ? "?" : ">"] }),
            );
        interaction.reply(
            "Prefijo Removido\nAhora el bot escucha: `" +
                this.client.servers.get(interaction.guildId as string)?.prefixies.join("`, `") +
                "`",
        );
        this.deploy(interaction.guild as Guild);
    }

    removeLogChannel(interaction: CommandInteraction) {
        const log = interaction.options.getString("logName");
        const server = this.client.servers.get(interaction.guildId as string);
        if (!server) return interaction.reply("Removido");
        if (log === "message_update") server.removeMessageUpdateLog();
        else if (log === "message_delete") server.removeMessageDeleteLog();
        else if (log === "message_attachment") server.removeMessageAttachmentLog();
        return interaction.reply("Log Removido");
    }
}
