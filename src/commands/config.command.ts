/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
    ApplicationCommandDataResolvable,
    CommandInteraction,
    Guild,
    MessageAttachment,
    Permissions,
    TextChannel,
} from 'discord.js'
import {
    Command,
    Client,
    CommandType,
    Server,
    LangType,
} from '../utils/classes'
import { permissionsError } from '../utils/utils'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { Buffer } from 'buffer'

export default class Config extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'config',
            description: 'config',
            defaultPermission: false,
            type: CommandType.guild,
        })
    }

    getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        const server = this.client.servers.get(guild?.id as string)
        const suggestChannelsChoices = server?.suggestChannels.map((c) => [
            c.default ? 'default' : c.alias,
            c.channel,
        ])
        const logs = ['message_update', 'message_delete', 'message_attachment']
        const subcommandsLogs = logs.map((i) =>
            new SlashCommandSubcommandBuilder()
                .setName(i)
                .setDescription(`Config ${i} logs`)
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('Channel where the logs are send')
                        .setRequired(true)
                        .addChannelType(0)
                )
        )
        const command = this.baseCommand
            .addSubcommandGroup((subcommandGroup) =>
                subcommandGroup
                    .setName('set') // group
                    .setDescription('set configs')
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('language') // command
                            .setDescription('Set language')
                            .addStringOption((option) =>
                                option
                                    .setName('lang') // option
                                    .setDescription('Language')
                                    .setRequired(true)
                                    .addChoices([
                                        ['Español', LangType.es],
                                        ['English', LangType.en],
                                    ])
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('prefix')
                            .setDescription('Set a new unique prefix')
                            .addStringOption((option) =>
                                option
                                    .setName('prefix')
                                    .setDescription('New prefix')
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('suggest_channel')
                            .setDescription('Set a unique suggest channel')
                            .addChannelOption((option) =>
                                option
                                    .setName('channel')
                                    .setDescription(
                                        'Channel where the suggest are sent'
                                    )
                                    .addChannelType(0)
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('birthday_channel')
                            .setDescription('Set a channel to say happy birthday to your users')
                            .addChannelOption(option => 
                                option
                                    .setName('channel')
                                    .setDescription('The channel to use')
                                    .addChannelType(0)
                                    .setRequired(true)
                            )
                    )
            )
            .addSubcommandGroup((subcommandGroup) =>
                subcommandGroup
                    .setName('add')
                    .setDescription('add config')
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('prefix')
                            .setDescription('Add a new prefix to the bot')
                            .addStringOption((option) =>
                                option
                                    .setName('prefix')
                                    .setDescription('A new prefix')
                                    .setRequired(true)
                            )
                    )
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('suggest_channel')
                            .setDescription('Add a new suggest channel')
                            .addChannelOption((option) =>
                                option
                                    .setName('channel')
                                    .setDescription('Channel to suggest')
                                    .setRequired(true)
                                    .addChannelType(0)
                            )
                            .addStringOption((option) =>
                                option
                                    .setName('alias')
                                    .setDescription(
                                        'Name to refired a suggest channel'
                                    )
                                    .setRequired(true)
                            )
                            .addBooleanOption((option) =>
                                option
                                    .setName('default')
                                    .setDescription(
                                        'Set a default suggestion channel'
                                    )
                            )
                    )
            )
            .addSubcommandGroup((subcommandGroup) =>
                subcommandGroup
                    .setName('remove')
                    .setDescription('remove config')
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('prefix')
                            .setDescription('Remove prefix')
                            .addStringOption((option) =>
                                option
                                    .setName('prefix')
                                    .setDescription('Prefix to remove')
                                    .addChoices(
                                        server
                                            ?.getPrefixes(true)
                                            .map((i) => [i, i]) ?? [
                                            ['>', '>'],
                                            ['?', '?'],
                                        ]
                                    )
                            )
                    )
                    .addSubcommand((subcommand) => {
                        subcommand
                            .setName('suggest_channel')
                            .setDescription('Remove suggestion channel')
                        if (
                            suggestChannelsChoices &&
                            suggestChannelsChoices.length > 0
                        )
                            subcommand.addStringOption((option) =>
                                option
                                    .setName('alias')
                                    .setDescription(
                                        'Alias of channel to remove'
                                    )
                                    .setRequired(true)
                                    .addChoices(
                                        suggestChannelsChoices as [
                                            name: string,
                                            value: string
                                        ][]
                                    )
                            )
                        return subcommand
                    })
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('log')
                            .setDescription('Remove log channel')
                            .addStringOption((option) =>
                                option
                                    .setName('logname')
                                    .setDescription('Log name to remove')
                                    .setRequired(true)
                                    .addChoices(logs.map((l) => [l, l]))
                            )
                    )
                    .addSubcommand(subcommand =>
                        subcommand
                            .setName('birthday_channel')
                            .setDescription('Remove the channel to celebrate user\'s birthdays')
                    )
            )
            .addSubcommandGroup((subcommandGroup) => {
                subcommandGroup
                    .setName('log')
                    .setDescription('Config the logs channels')
                for (const scl of subcommandsLogs) {
                    subcommandGroup.addSubcommand(scl)
                }
                return subcommandGroup
            })
            .addSubcommandGroup((subcommandGroup) =>
                subcommandGroup
                    .setName('export')
                    .setDescription('Export the config file')
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('file')
                            .setDescription('Export the config file')
                    )
            )
            .addSubcommandGroup((subcommandGroup) =>
                subcommandGroup
                    .setName('import')
                    .setDescription('Import the config file')
                    .addSubcommand((subcommand) =>
                        subcommand
                            .setName('file')
                            .setDescription('Export the config file')
                    )
            ).toJSON() as any
        const _ = command.options
            .find((o: { name: string }) => o.name === 'import')
            ?.options.find((o: { name: string }) => o.name === 'file')
        _.options = [
            {
                type: 11,
                name: 'json',
                description: 'Configuration json file',
                required: true,
            },
        ]
        // console.log(JSON.stringify(command.options?.[5].options, null, 1))
        return new Promise((resolve) => resolve(command))
    }

    run(interaction: CommandInteraction) {
        /* eslint indent: [2, 4, {"SwitchCase": 1}] */
        const subCommand = interaction.options.getSubcommand()
        switch(interaction.options.getSubcommandGroup()){
            case 'export':
                if(subCommand === 'file')
                    this.exportConfig(interaction)
                break
            case 'add':
                if (subCommand === 'prefix')
                    this.addPrefix(interaction)
                if (subCommand === 'suggest_channel')
                    this.addSuggestChannel(interaction)
                break
            case 'remove':
                if (subCommand === 'prefix')
                    this.removePrefix(interaction)
                if (subCommand === 'suggest_channel')
                    this.removeSuggestChannel(interaction)
                if (subCommand === 'log')
                    this.removeLogChannel(interaction)
                if (subCommand === 'birthday_channel')
                    this.removeBirthdayChannel(interaction)
                break
            default: 
                import(`./config/${interaction.options.getSubcommandGroup()}`).then(scg => scg[subCommand](interaction))
        }
    }
    
    async exportConfig(
        interaction: CommandInteraction<import('discord.js').CacheType>
    ) {
        await interaction.deferReply()
        const server = this.client.servers.get(interaction.guildId as string)
        const snap = await server?.db?.get()
        const defaultConfig = {
            prefixies: ['>', '?'],
            lang: 'en',
            logs_channels: {
                message_update: null,
                message_delete: null,
                message_attachment: null,
            },
            suggest_channels: [
                {
                    channel: null,
                    default: false,
                    alias: null,
                },
            ],
        }
        if (!snap?.exists)
            return interaction.editReply({
                files: [
                    new MessageAttachment(
                        Buffer.from(JSON.stringify(defaultConfig, null, 4)),
                        `${interaction.guild?.name}_${interaction.client.user?.username}_config.json`
                    ),
                ],
            })
        const sc = snap.data()
        console.log(snap.id, snap.data())
        if (!sc) return
        if (sc.prefixies) defaultConfig.prefixies = sc.prefixies
        if (sc.lang) defaultConfig.lang = sc.lang
        if (sc.logs_channels) {
            const lg = sc.logs_channels
            if (lg.message_update)
                defaultConfig.logs_channels.message_update = lg.message_update
            if (lg.message_attachment)
                defaultConfig.logs_channels.message_attachment =
                    lg.message_attachment
            if (lg.message_delete)
                defaultConfig.logs_channels.message_delete = lg.message_delete
        }
        if (sc.suggest_channels && sc.suggest_channels.length > 0)
            defaultConfig.suggest_channels = sc.suggest_channels
        return interaction.editReply({
            files: [
                new MessageAttachment(
                    Buffer.from(JSON.stringify(defaultConfig, null, 4)),
                    `${interaction.guild?.name}_${interaction.client.user?.username}_config.json`
                ),
            ],
        })
    }

    addPrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id)
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return permissionsError(
                interaction,
                Permissions.FLAGS.ADMINISTRATOR
            )
        const prefix: string = interaction.options.getString(
            'prefix',
            true
        ) as string
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers
                .get(interaction.guildId as string)
                ?.addPrefix(prefix)
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, { prefixes: ['>', '?', prefix] })
            )
        interaction.reply(this.client.servers.get(interaction.guildId!)!.translate('config_cmd.add_prefix', { prefix, prefixies: this.client.servers.get(interaction.guildId!)!.prefixies }))
        this.deploy(interaction.guild as Guild)
    }

    addSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id)
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
            return permissionsError(
                interaction,
                Permissions.FLAGS.MANAGE_CHANNELS
            )
        const channel = interaction.options.getChannel(
            'channel',
            true
        ) as TextChannel
        const alias = (
            interaction.options.getString('alias', true) as string
        ).toLowerCase()
        const isDefault = interaction.options.getBoolean('default') ?? false
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers
                .get(interaction.guildId as string)
                ?.addSuggestChannel({
                    channel: channel.id,
                    default: isDefault,
                    alias: alias,
                })
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, {
                    suggest_channels: [
                        {
                            channel: channel.id,
                            default: isDefault,
                            alias: alias,
                        },
                    ],
                })
            )
        interaction.reply(this.client.servers.get(interaction.guildId!)!.translate('config_cmd.add_suggest_channel.reply', { channel, alias }))
        channel
            .sendTyping()
            .then(() => channel.send(this.client.servers.get(interaction.guildId!)!.translate('config_cmd.add_suggest_channel.message', { channel, alias })))
        this.deploy(interaction.guild as Guild)
        channel.setRateLimitPerUser(21600)
    }

    removeSuggestChannel(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id)
        if (!member?.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
            return permissionsError(
                interaction,
                Permissions.FLAGS.MANAGE_CHANNELS
            )
        let server = this.client.servers.get(interaction.guildId!)
        if (!server) server = new Server(interaction.guild!)
        const channelId = interaction.options.getString('alias')
        if (!channelId) return interaction.reply(server.translate('config_cmd.remove_suggest_channel.dont_exist'))
        server.removeSuggestChannel(channelId)
        this.client.servers.set(interaction.guildId!, server)
        interaction.reply(server.translate('config_cmd.remove_suggest_channel.dont_exist'))
        this.deploy(interaction.guild as Guild)
    }

    removePrefix(interaction: CommandInteraction): any {
        const member = interaction.guild?.members.cache.get(interaction.user.id)
        if (!member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return permissionsError(
                interaction,
                Permissions.FLAGS.ADMINISTRATOR
            )
        const prefix = interaction.options.getString('prefix', true)
        if (this.client.servers.has(interaction.guildId as string))
            this.client.servers
                .get(interaction.guildId as string)
                ?.removePrefix(prefix)
        else if (interaction.guild)
            this.client.servers.set(
                interaction.guildId as string,
                new Server(interaction.guild, {
                    prefixes: [prefix === '>' ? '?' : '>'],
                })
            )
        interaction.reply(this.client.servers.get(interaction.guildId!)!.translate('remove_prefix'))
        this.deploy(interaction.guild as Guild)
    }

    removeLogChannel(interaction: CommandInteraction) {
        const log = interaction.options.getString('logname')
        let server = this.client.servers.get(interaction.guildId as string)
        if (!server) {
            server = new Server(interaction.guild!)
            this.client.servers.set(interaction.guildId!, server)
            return interaction.reply(server.translate('config_cmd.remove_log'))
        }
        if (log === 'message_update') server.removeMessageUpdateLog()
        else if (log === 'message_delete') server.removeMessageDeleteLog()
        else if (log === 'message_attachment')
            server.removeMessageAttachmentLog()
        return interaction.reply(server.translate('config_cmd.remove_log'))
    }

    removeBirthdayChannel(interaction: CommandInteraction) {
        const server = this.client.servers.get(interaction.guildId!)!
        server.removeBirthdayChannel()
        interaction.reply(server.translate('config_cmd.remove_birthday'))
    }
}
