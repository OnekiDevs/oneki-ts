import { ApplicationCommandDataResolvable, CommandInteraction, Guild, Permissions, TextChannel } from "discord.js";
import { Command, Client, CommandType, Server, LangType } from "../utils/clases";
import { ChannelType } from "discord-api-types";
import { permissionsError } from "../utils/utils";

export default class Config extends Command {
    constructor(client: Client) {
        super(client, {
            name: "config",
            description: "config",
            defaultPermission: false,
            type: CommandType.guild,
        });
    }

    getData(guild?: Guild): ApplicationCommandDataResolvable {
        const server = this.client.servers.get(guild?.id as string);
        const suggestChannelsChoices = server?.suggest_channels.map((c) => [c.default ? "default" : c.alias, c.channel_id]);
        return this.baseCommand
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
                            .addStringOption((option) => option.setName("prefix").setDescription("New prefix").setRequired(true)),
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("suggest_channel")
                            .setDescription("Aet a unique suggest channel")
                            .addChannelOption((option) =>
                                option.setName("channel").setDescription("Channel were the suggest are sent").addChannelType(ChannelType.GuildText).setRequired(true),
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
                            .setDescription("add a new pfrefix to the bot")
                            .addStringOption((option) => option.setName("prefix").setDescription("a new prefix").setRequired(true)),
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("suggest_channel")
                            .setDescription("add a new suggest channel")
                            .addChannelOption((option) => option.setName("channel").setDescription("channel to suggest").setRequired(true).addChannelType(ChannelType.GuildText))
                            .addStringOption((option) => option.setName("alias").setDescription("name to refired a suggest channel").setRequired(true))
                            .addBooleanOption((option) => option.setName("default").setDescription("set a default suggestion channel")),
                    ),
            )
            .addSubcommandGroup((subcommandGroup) =>
                subcommandGroup
                    .setName("remove")
                    .setDescription("remove config")
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName("prefix")
                            .setDescription("remove prefix")
                            .addStringOption((option) =>
                                option
                                    .setName("prefix")
                                    .setDescription("prefix to remove")
                                    .addChoices(
                                        server?.getPrefixes(true).map((i) => [i, i]) ?? [
                                            [">", ">"],
                                            ["?", "?"],
                                        ],
                                    ),
                            ),
                    )
                    .addSubcommand((subcommand) => {
                        subcommand.setName("suggest_channel").setDescription("remove suggestion channel");
                        if (suggestChannelsChoices && suggestChannelsChoices.length > 0)
                            subcommand.addStringOption((option) =>
                                option
                                    .setName("channel")
                                    .setDescription("alias of channel to remove")
                                    .setRequired(true)
                                    .addChoices(suggestChannelsChoices as [name: string, value: string][]),
                            );
                        return subcommand;
                    }),
            )
            .toJSON() as ApplicationCommandDataResolvable;
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
        }
    }

    setLanguage(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const lang = interaction.options.getString("lang") as LangType;
        if (this.client.servers.has(interaction.guildId)) this.client.servers.get(interaction.guildId)?.setLang(lang);
        else if (interaction.guild) this.client.servers.set(interaction.guildId, new Server(interaction.guild, { lang }));
        interaction.reply("Lenguaje Establecido en `" + lang + "`");
        //TODO: reiniciar comandos de servidor 
    }

    setPrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const prefix: string = interaction.options.getString("prefix", true) as string;
        if (this.client.servers.has(interaction.guildId)) this.client.servers.get(interaction.guildId)?.setPrefix(prefix);
        else if (interaction.guild) this.client.servers.set(interaction.guildId, new Server(interaction.guild, { prefixies: [prefix] }));
        interaction.reply("Prefijo Establecido a `" + prefix + "`");
        this.deploy(interaction.guild as Guild)
    }

    setSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return permissionsError(interaction, Permissions.FLAGS.MANAGE_CHANNELS);
        const channel = interaction.options.getChannel("channel", true) as TextChannel;
        if (this.client.servers.has(interaction.guildId)) this.client.servers.get(interaction.guildId)?.setSuggestChannel(channel);
        else if (interaction.guild) this.client.servers.set(interaction.guildId, new Server(interaction.guild, { suggest_channels: [{ channel_id: channel.id, default: true }] }));
        interaction.reply("Canal " + channel + " Establecido Para Sugerencias");
        channel.sendTyping().then(() => channel.send("Este canal ahora esta establecido para las sugerencias\npara hacer una sugerencia usa **/suggest**")); //TODO: autoconfigurar el canal
        this.deploy(interaction.guild as Guild)
    }

    addPrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const prefix: string = interaction.options.getString("prefix", true) as string;
        if (this.client.servers.has(interaction.guildId)) this.client.servers.get(interaction.guildId)?.addPrefix(prefix);
        else if (interaction.guild) this.client.servers.set(interaction.guildId, new Server(interaction.guild, { prefixies: [">", "?", prefix] }));
        interaction.reply("Prefijo `" + prefix + "` Agregado\nAhora el bot escucha: `'+this.client.servers.get(interaction.guildId)?.prefixies.join('`, `')+'`'");
        this.deploy(interaction.guild as Guild)
    }

    addSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return permissionsError(interaction, Permissions.FLAGS.MANAGE_CHANNELS);
        const channel = interaction.options.getChannel("channel", true) as TextChannel;
        const alias = (interaction.options.getString("alias", true) as string).toLowerCase();
        const isDefault = interaction.options.getBoolean("default") ?? false;
        if (this.client.servers.has(interaction.guildId))
            this.client.servers.get(interaction.guildId)?.addSuggestChannel({ channel_id: channel.id, default: isDefault, alias: alias });
        else if (interaction.guild)
            this.client.servers.set(interaction.guildId, new Server(interaction.guild, { suggest_channels: [{ channel_id: channel.id, default: isDefault, alias: alias }] }));
        channel.sendTyping().then(() => channel.send("Este canal ahora esta establecido para las sugerencias\npara hacer una sugerencia usa **/suggest `channel:alias`**")); //TODO: autoconfigurar el canal
        this.deploy(interaction.guild as Guild)
    }

    removeSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return permissionsError(interaction, Permissions.FLAGS.MANAGE_CHANNELS);
        const channelId = interaction.options.getString("channel");
        if (!channelId) return interaction.reply("no existe ningun canal configurado");
        if (this.client.servers.has(interaction.guildId)) this.client.servers.get(interaction.guildId)?.removeSuggestChannel(channelId);
        else console.error("Remove suggest channel error:\n\tdont exist server class from " + interaction.guild?.name + " server with id " + interaction.guild?.id);
        interaction.reply('Canal Removido')
        this.deploy(interaction.guild as Guild)
    }

    removePrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return permissionsError(interaction, Permissions.FLAGS.ADMINISTRATOR);
        const prefix = interaction.options.getString("prefix", true);
        if (this.client.servers.has(interaction.guildId)) this.client.servers.get(interaction.guildId)?.removePrefix(prefix);
        else if (interaction.guild) this.client.servers.set(interaction.guildId, new Server(interaction.guild, { prefixies: [prefix === ">" ? "?" : ">"] }));
        interaction.reply('Prefijo Removido\nAhora el bot escucha: `'+this.client.servers.get(interaction.guildId)?.prefixies.join('`, `')+'`')
        this.deploy(interaction.guild as Guild)
    }
}
