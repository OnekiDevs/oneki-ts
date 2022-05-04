// /* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Guild, PermissionsBitField } from 'discord.js'
import { Command, Client } from '../utils/classes.js'
import { CommandOptions } from '../classes/Command.js'

export default class Config extends Command {
    constructor(client: Client) {
        super(client, {
            name: {
                'en-US': 'config',
                'es-ES': 'configuracion',
            },
            description: {
                'en-US': 'Configure the bot',
                'es-ES': 'Configurar el bot',
            },
            permissions: new PermissionsBitField(PermissionsBitField.Flags.ManageGuild),
            global: false,
            options: [{
                name: 'export',
                description: 'Export the bot configuration file',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [{
                    name: 'file',
                    description: 'Export the bot configuration file',
                    type: ApplicationCommandOptionType.Subcommand,
                }]
            }, {
                name: 'import',
                description: 'Import the bot configuration file',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [{
                    name: 'file',
                    description: 'Configuration JSON file',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'json',
                        description: 'Import the bot configuration file',
                        type: ApplicationCommandOptionType.Attachment,
                        required: true
                    }]
                }]
            }, {
                name: 'set',
                description: 'set the bot configuration',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [{
                    name: 'prefix',
                    description: 'set the bot prefix',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'prefix',
                        description: 'set the bot prefix',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }]
                }, {
                    name: 'keep_roles',
                    description: 'Set whether or not the bot should save a user\'s role and apply it when they join the server',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'keep_roles',
                        description: 'Keep roles?',
                        type: ApplicationCommandOptionType.Boolean,
                        required: true
                    }]
                }, {
                    name: 'suggest_channel',
                    description: 'Set a unique channel where the bot will post suggestions',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'channel',
                        description: 'Channel where the bot will post suggestions',
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [0],
                        required: true
                    }]
                }, {
                    name: 'birthday_channel',
                    description: 'Set a channel to say happy birthday to your users',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'channel',
                        description: 'Channel where the bot will say happy birthday to your users',
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [0],
                        required: true
                    }]
                }, {
                    name: 'birthday_message',
                    description: 'Change your happy birthday\'s announcement',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'message',
                        description: 'The message that will be sent to your users',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }]
                }]
            }, {
                name: 'add',
                description: 'Add config',
                type: ApplicationCommandOptionType.SubcommandGroup,
                options: [{
                    name: 'prefix',
                    description: 'Add a new prefix to the bot',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'prefix',
                        description: 'A new prefix',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }]
                }, {
                    name: 'suggest_channel',
                    description: 'Add a new channel where the bot will post suggestions',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'channel',
                        description: 'Channel where the bot will post suggestions',
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [0],
                        required: true
                    }, {
                        name: 'alias',
                        description: 'The alias of the channel',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }, {
                        name: 'default',
                        description: 'Is this the default channel?',
                        type: ApplicationCommandOptionType.Boolean,
                    }]
                }, {
                    name: 'blacklisted_word',
                    description: 'Add a new blacklisted word',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'word',
                        description: 'The word to blacklist',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }]
                }, {
                    name: 'ignored_channel',
                    description: 'Add a new channel where the bot will ignore',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [{
                        name: 'channel',
                        description: 'Channel where the bot will ignore',
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [0],
                        required: true
                    }]
                }]
            }]
        })
    }

    async createData(guild: Guild): Promise<void> {

        const server = this.client.getServer(guild)
        
        // logs
        const logs = ['message_update', 'message_delete', 'message_attachment', 'invites', 'member_update']
        const logsOptions = logs.map(log => ({
            name: log,
            description: `Config ${log} log`,
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'channel',
                description: 'Channel where the bot will send the log',
                type: ApplicationCommandOptionType.Channel,
                channel_types: [0],
                required: true
            }]
        })).concat({
            name: 'auto',
            description: 'Config automactically the logs',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'category',
                description: 'Category where the channels will be created',
                type: ApplicationCommandOptionType.Channel,
                channel_types: [4],
                required: true
            }]
        })
        this.addOption({
            name: 'logs',
            description: 'Set the logs',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: logsOptions
        })

        // remove
        const prefixesChoices = server.getPrefixes(true).map(i => ({ name: i, value: i })) ?? [
            { name: '>', value: '>' },
            { name: '?', value: '?' }
        ]
        const suggestChannelsChoices = server.suggestChannels.map(c => ({
            name: c.default ? 'default' : c.alias as string,
            value: c.channel
        }))
        const logsChoices = logs.map(l => ({
            name: l,
            value: l
        }))
        this.addOption({
            name: 'remove',
            description: 'Remove a config',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [{
                name: 'prefix',
                description: 'Remove a prefix',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'prefix',
                    description: 'The prefix to remove',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: prefixesChoices
                }]
            }, {
                name: 'suggest_channel',
                description: 'Remove a suggest channel',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'alias',
                    description: 'The alias of the channel to remove',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: suggestChannelsChoices
                }]
            }, {
                name: 'log',
                description: 'Remove a log',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'logname',
                    description: 'The log to remove',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: logsChoices
                }]
            }, {
                name: 'birthday_channel',
                description: 'Remove a birthday channel',
                type: ApplicationCommandOptionType.Subcommand,
            }, {
                name: 'blacklisted_word',
                description: 'Remove a blacklisted word',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'word',
                    description: 'The word to remove',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }]
            }, {
                name: 'ignored_channel',
                description: 'Remove a ignored channel',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'channel',
                    description: 'The channel to remove',
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [0],
                    required: true
                }]
            }]
        })

        // autoroles

        const moreAutorolesOptions: CommandOptions[] = [{
            name: 'create',
            description: 'Create a new autorole group',
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'name',
                description: 'The name of the autorole group',
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        }]

        if (server.autoroles && server.autoroles.size > 0) {
            const groupChoices = Array.from(server.autoroles.keys()).map(r => ({
                name: r,
                value: r
            }))
            // add
            moreAutorolesOptions.push({
                name: 'add',
                description: 'Add a new role in the autorole group',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'group',
                    description: 'The group to add the role',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: groupChoices
                }, {
                    name: 'role',
                    description: 'The role to add',
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }]
            })

            // remove
            moreAutorolesOptions.push({
                name: 'remove',
                description: 'Remove a role in the autorole group',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'group',
                    description: 'The group to remove the role',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: groupChoices
                }, {
                    name: 'role',
                    description: 'The role to remove',
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }]
            })

            // remove_group
            moreAutorolesOptions.push({
                name: 'remove_group',
                description: 'Remove a autorole group',
                type: ApplicationCommandOptionType.Subcommand,  
                options: [{
                    name: 'group',
                    description: 'The group to remove',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: groupChoices
                }]
            })

            // display
            moreAutorolesOptions.push({
                name: 'display',
                description: 'Display the autorole group',
                type: ApplicationCommandOptionType.Subcommand,
                options: [{
                    name: 'group',
                    description: 'The group to display',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: groupChoices
                }, {
                    name: 'channel',
                    description: 'The channel where the bot will send the autorole',
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [0]
                }, {
                    name: 'message',
                    description: 'The message to display',
                    type: ApplicationCommandOptionType.String
                }]
            })

        }
        this.addOption({
            name: 'autoroles',
            description: 'Config the autoroles',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: moreAutorolesOptions
        })
    }

    async interacion(interaction: ChatInputCommandInteraction<'cached'>) {
        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup()
        import(`./config/${subcommandGroup}.js`).then(scg => scg[subcommand](interaction)).catch(() => '')
    }
}
