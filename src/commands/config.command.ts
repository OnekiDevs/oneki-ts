// /* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ApplicationCommandOptionType,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Guild,
    PermissionsBitField
} from 'discord.js'
import { Command, Client } from '../utils/classes.js'
import { SubcommandCommandOptions } from '../classes/Command.js'
import { Translator } from '../utils/utils.js'

export default class Config extends Command {
    constructor(client: Client) {
        super(client, {
            name: {
                'en-US': 'config',
                'es-ES': 'configuracion'
            },
            description: {
                'en-US': 'Configure the bot',
                'es-ES': 'Configurar el bot'
            },
            permissions: new PermissionsBitField(PermissionsBitField.Flags.ManageGuild),
            global: false,
            options: [
                {
                    name: {
                        'en-US': 'export',
                        'es-ES': 'exportar'
                    },
                    description: {
                        'en-US': "Export the bot's configuration",
                        'es-ES': 'Exportar la configuración del bot'
                    },
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    options: [
                        {
                            name: {
                                'en-US': 'file',
                                'es-ES': 'archivo'
                            },
                            description: {
                                'en-US': "Export the bot's configuration to a file",
                                'es-ES': 'Exportar la configuración del bot a un archivo'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'format',
                                        'es-ES': 'formato'
                                    },
                                    description: {
                                        'en-US': 'Choose the format of the exported file',
                                        'es-ES': 'Elige el formato del archivo exportado'
                                    },
                                    type: ApplicationCommandOptionType.String,
                                    choices: [
                                        {
                                            name: 'JSON',
                                            value: 'json'
                                        },
                                        {
                                            name: 'YAML',
                                            value: 'yml'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'import',
                        'es-ES': 'importar'
                    },
                    description: {
                        'en-US': "Import the bot's configuration file",
                        'es-ES': 'Importar el archivo de configuración del bot'
                    },
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    options: [
                        {
                            name: {
                                'en-US': 'file',
                                'es-ES': 'archivo'
                            },
                            description: {
                                'en-US': 'Configuration JSON file',
                                'es-ES': 'Archivo JSON de configuración'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'file',
                                        'es-ES': 'archivo'
                                    },
                                    description: {
                                        'en-US': 'Configuration JSON or YAML file',
                                        'es-ES': 'Archivo JSON o YAML de configuración'
                                    },
                                    type: ApplicationCommandOptionType.Attachment,
                                    required: true
                                }
                            ]
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'set',
                        'es-ES': 'establecer'
                    },
                    description: {
                        'en-US': "set the bot's configuration",
                        'es-ES': 'establecer la configuración del bot'
                    },
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    options: [
                        {
                            name: {
                                'en-US': 'prefix',
                                'es-ES': 'prefijo'
                            },
                            description: {
                                'en-US': "Set the bot's prefix",
                                'es-ES': 'Establecer el prefijo del bot'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'prefix',
                                        'es-ES': 'prefijo'
                                    },
                                    description: {
                                        'en-US': 'Prefix to use',
                                        'es-ES': 'Prefijo a usar'
                                    },
                                    type: ApplicationCommandOptionType.String,
                                    required: true
                                }
                            ]
                        },
                        {
                            name: {
                                'en-US': 'keep_roles',
                                'es-ES': 'manejar_roles'
                            },
                            description: {
                                'en-US':
                                    "Set whether or not the bot should save a user's role and apply it when they join the server",
                                'es-ES':
                                    'Establecer si el bot debe guardar un rol de un usuario y aplicarlo cuando se una al servidor'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'keep_roles',
                                        'es-ES': 'mantener_roles'
                                    },
                                    description: {
                                        'en-US': 'Keep roles?',
                                        'es-ES': 'Mantener roles?'
                                    },
                                    type: ApplicationCommandOptionType.Boolean,
                                    required: true
                                }
                            ]
                        },
                        {
                            name: {
                                'en-US': 'suggest_channel',
                                'es-ES': 'canal_de_sugerencias'
                            },
                            description: {
                                'en-US': 'Set a unique channel where the bot will post suggestions',
                                'es-ES': 'Establecer un canal único donde el bot debe publicar sugerencias'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'channel',
                                        'es-ES': 'canal'
                                    },
                                    description: {
                                        'en-US': 'Channel where the bot will post suggestions',
                                        'es-ES': 'Canal donde el bot debe publicar sugerencias'
                                    },
                                    type: ApplicationCommandOptionType.Channel,
                                    channel_types: [0],
                                    required: true
                                }
                            ]
                        },
                        {
                            name: {
                                'en-US': 'birthday_channel',
                                'es-ES': 'canal_de_cumpleaños'
                            },
                            description: {
                                'en-US': 'Set a channel to say happy birthday to your users',
                                'es-ES': 'Establecer un canal para decir feliz cumpleaños a sus usuarios'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'channel',
                                        'es-ES': 'canal'
                                    },
                                    description: {
                                        'en-US': 'Channel where the bot will say happy birthday to your users',
                                        'es-ES': 'Canal donde el bot debe decir feliz cumpleaños a sus usuarios'
                                    },
                                    type: ApplicationCommandOptionType.Channel,
                                    channel_types: [0],
                                    required: true
                                }
                            ]
                        },
                        {
                            name: {
                                'en-US': 'birthday_message',
                                'es-ES': 'mensaje_de_cumpleaños'
                            },
                            description: {
                                'en-US': "Change your happy birthday's announcement",
                                'es-ES': 'Cambiar su anuncio de feliz cumpleaños'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'message',
                                        'es-ES': 'mensaje'
                                    },
                                    description: {
                                        'en-US': 'The message that will be sent to your users',
                                        'es-ES': 'El mensaje que se enviará a sus usuarios'
                                    },
                                    type: ApplicationCommandOptionType.String,
                                    required: true
                                }
                            ]
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'add',
                        'es-ES': 'agregar'
                    },
                    description: {
                        'en-US': 'Add config',
                        'es-ES': 'Agregar configuración'
                    },
                    type: ApplicationCommandOptionType.SubcommandGroup,
                    options: [
                        {
                            name: {
                                'en-US': 'prefix',
                                'es-ES': 'prefijo'
                            },
                            description: {
                                'en-US': 'Add a new prefix to the bot',
                                'es-ES': 'Agregar un nuevo prefijo al bot'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'prefix',
                                        'es-ES': 'prefijo'
                                    },
                                    description: {
                                        'en-US': 'A new prefix',
                                        'es-ES': 'Un nuevo prefijo'
                                    },
                                    type: ApplicationCommandOptionType.String,
                                    required: true
                                }
                            ]
                        },
                        {
                            name: {
                                'en-US': 'suggest_channel',
                                'es-ES': 'canal_de_sugerencias'
                            },
                            description: {
                                'en-US': 'Add a new channel where the bot will post suggestions',
                                'es-ES': 'Agregar un nuevo canal donde el bot debe publicar sugerencias'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'channel',
                                        'es-ES': 'canal'
                                    },
                                    description: {
                                        'en-US': 'Channel where the bot will post suggestions',
                                        'es-ES': 'Canal donde el bot debe publicar sugerencias'
                                    },
                                    type: ApplicationCommandOptionType.Channel,
                                    channel_types: [0],
                                    required: true
                                },
                                {
                                    name: {
                                        'en-US': 'alias',
                                        'es-ES': 'alias'
                                    },
                                    description: {
                                        'en-US': 'The alias of the channel',
                                        'es-ES': 'El alias del canal'
                                    },
                                    type: ApplicationCommandOptionType.String,
                                    required: true
                                },
                                {
                                    name: {
                                        'en-US': 'default',
                                        'es-ES': 'predeterminado'
                                    },
                                    description: {
                                        'en-US': 'Is this the default channel?',
                                        'es-ES': '¿Es este el canal predeterminado?'
                                    },
                                    type: ApplicationCommandOptionType.Boolean
                                }
                            ]
                        },
                        {
                            name: {
                                'en-US': 'blacklisted_word',
                                'es-ES': 'palabra_blacklisteada'
                            },
                            description: {
                                'en-US': 'Add a new word to the blacklist',
                                'es-ES': 'Agregar una nueva palabra a la lista negra'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'word',
                                        'es-ES': 'palabra'
                                    },
                                    description: {
                                        'en-US': 'The word to blacklist',
                                        'es-ES': 'La palabra a blacklistear'
                                    },
                                    type: ApplicationCommandOptionType.String,
                                    required: true
                                }
                            ]
                        },
                        {
                            name: {
                                'en-US': 'ignored_channel',
                                'es-ES': 'canal_ignorado'
                            },
                            description: {
                                'en-US': 'Add a new channel where the bot will ignore',
                                'es-ES': 'Agregar un nuevo canal que el bot debe ignorar'
                            },
                            type: ApplicationCommandOptionType.Subcommand,
                            options: [
                                {
                                    name: {
                                        'en-US': 'channel',
                                        'es-ES': 'canal'
                                    },
                                    description: {
                                        'en-US': 'Channel where the bot will ignore',
                                        'es-ES': 'Canal que el bot debe ignorar'
                                    },
                                    type: ApplicationCommandOptionType.Channel,
                                    channel_types: [0],
                                    required: true
                                }
                            ]
                        }
                    ]
                }
            ],
            buttonRegex: /^config_.*$/i
        })
    }

    async createData(guild: Guild): Promise<void> {
        const server = this.client.getServer(guild)

        // logs
        const logs = ['message_update', 'message_delete', 'message_attachment', 'invites', 'member_update']
        const logsOptions = logs
            .map(log => ({
                name: {
                    'en-US': log,
                    'es-ES': log
                },
                description: {
                    'en-US': `Config ${log} log`,
                    'es-ES': `Configura el log de ${log}`
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: {
                            'en-US': 'channel',
                            'es-ES': 'canal'
                        },
                        description: {
                            'en-US': 'Channel where the bot will send the log',
                            'es-ES': 'Canal donde el bot debe enviar el log'
                        },
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [0],
                        required: true
                    }
                ]
            }))
            .concat({
                name: {
                    'en-US': 'auto',
                    'es-ES': 'auto'
                },
                description: {
                    'en-US': 'Config automactically the logs',
                    'es-ES': 'Configura automáticamente los logs'
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: {
                            'en-US': 'category',
                            'es-ES': 'categoría'
                        },
                        description: {
                            'en-US': 'Category where the channels will be created',
                            'es-ES': 'Categoría donde se crearán los canales'
                        },
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [4],
                        required: true
                    }
                ]
            })
        this.addOption({
            name: {
                'en-US': 'logs',
                'es-ES': 'logs'
            },
            description: {
                'en-US': 'Set the logs',
                'es-ES': 'Configurar los logs'
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: logsOptions as SubcommandCommandOptions[]
        })

        // remove
        const prefixesChoices = server.getPrefixes(true).map(i => ({ name: i, value: i })) ?? [
            { name: '>', value: '>' },
            { name: '?', value: '?' }
        ]
        const suggestChannelsChoices = server.suggestChannels.map(c => ({
            name: c.default ? 'default' : (c.alias as string),
            value: c.channel
        }))
        const logsChoices = logs.map(l => ({
            name: l,
            value: l
        }))
        this.addOption({
            name: {
                'en-US': 'remove',
                'es-ES': 'eliminar'
            },
            description: {
                'en-US': 'Remove a config',
                'es-ES': 'Eliminar una configuración'
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: {
                        'en-US': 'prefix',
                        'es-ES': 'prefijo'
                    },
                    description: {
                        'en-US': 'Remove a prefix',
                        'es-ES': 'Eliminar un prefijo'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'prefix',
                                'es-ES': 'prefijo'
                            },
                            description: {
                                'en-US': 'The prefix to remove',
                                'es-ES': 'El prefijo a eliminar'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: prefixesChoices
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'suggest_channel',
                        'es-ES': 'canal_de_sugerencias'
                    },
                    description: {
                        'en-US': 'Remove a suggest channel',
                        'es-ES': 'Eliminar un canal de sugerencias'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'alias',
                                'es-ES': 'alias'
                            },
                            description: {
                                'en-US': 'The alias of the channel to remove',
                                'es-ES': 'El alias del canal a eliminar'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: suggestChannelsChoices
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'log',
                        'es-ES': 'log'
                    },
                    description: {
                        'en-US': 'Remove a log',
                        'es-ES': 'Eliminar un log'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'logname',
                                'es-ES': 'nombre_del_log'
                            },
                            description: {
                                'en-US': 'The name of the log to remove',
                                'es-ES': 'El nombre del log a eliminar'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: logsChoices
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'birthday_channel',
                        'es-ES': 'canal_de_cumpleaños'
                    },
                    description: {
                        'en-US': 'Remove a birthday channel',
                        'es-ES': 'Eliminar un canal de cumpleaños'
                    },
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: {
                        'en-US': 'blacklisted_word',
                        'es-ES': 'palabra_blacklisteada'
                    },
                    description: {
                        'en-US': 'Remove a blacklisted word',
                        'es-ES': 'Eliminar una palabra blacklisteada'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'word',
                                'es-ES': 'palabra'
                            },
                            description: {
                                'en-US': 'The word to remove',
                                'es-ES': 'La palabra a eliminar'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: {
                        'en-US': 'ignored_channel',
                        'es-ES': 'canal_ignorado'
                    },
                    description: {
                        'en-US': 'Remove an ignored channel',
                        'es-ES': 'Eliminar un canal ignorado'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: {
                                'en-US': 'channel',
                                'es-ES': 'canal'
                            },
                            description: {
                                'en-US': 'The channel to remove',
                                'es-ES': 'El canal a eliminar'
                            },
                            type: ApplicationCommandOptionType.Channel,
                            channel_types: [0],
                            required: true
                        }
                    ]
                }
            ]
        })

        // autoroles

        const moreAutorolesOptions: SubcommandCommandOptions[] = [
            {
                name: {
                    'en-US': 'create',
                    'es-ES': 'crear'
                },
                description: {
                    'en-US': 'Create a new autorole group',
                    'es-ES': 'Crear un nuevo grupo de autoroles'
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: {
                            'en-US': 'name',
                            'es-ES': 'nombre'
                        },
                        description: {
                            'en-US': 'The name of the autorole group',
                            'es-ES': 'El nombre del grupo de autoroles'
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            }
        ]

        if (server.autoroles && server.autoroles.size > 0) {
            const groupChoices = Array.from(server.autoroles.keys()).map(r => ({
                name: r,
                value: r
            }))
            // add
            moreAutorolesOptions.push({
                name: {
                    'en-US': 'add',
                    'es-ES': 'añadir'
                },
                description: {
                    'en-US': 'Add a new role in the autorole group',
                    'es-ES': 'Añadir un nuevo rol al grupo de autoroles'
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: {
                            'en-US': 'group',
                            'es-ES': 'grupo'
                        },
                        description: {
                            'en-US': 'The group to add the role',
                            'es-ES': 'El grupo al que añadir el rol'
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: groupChoices
                    },
                    {
                        name: {
                            'en-US': 'role',
                            'es-ES': 'rol'
                        },
                        description: {
                            'en-US': 'The role to add',
                            'es-ES': 'El rol a añadir'
                        },
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ]
            })

            // remove
            moreAutorolesOptions.push({
                name: {
                    'en-US': 'remove',
                    'es-ES': 'eliminar'
                },
                description: {
                    'en-US': 'Remove a role in the autorole group',
                    'es-ES': 'Eliminar un rol del grupo de autoroles'
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: {
                            'en-US': 'group',
                            'es-ES': 'grupo'
                        },
                        description: {
                            'en-US': 'The group to remove the role',
                            'es-ES': 'El grupo del que eliminar el rol'
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: groupChoices
                    },
                    {
                        name: {
                            'en-US': 'role',
                            'es-ES': 'rol'
                        },
                        description: {
                            'en-US': 'The role to remove',
                            'es-ES': 'El rol a eliminar'
                        },
                        type: ApplicationCommandOptionType.Role,
                        required: true
                    }
                ]
            })

            // remove_group
            moreAutorolesOptions.push({
                name: {
                    'en-US': 'remove_group',
                    'es-ES': 'eliminar_grupo'
                },
                description: {
                    'en-US': 'Remove an autorole group',
                    'es-ES': 'Eliminar un grupo de autoroles'
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: {
                            'en-US': 'group',
                            'es-ES': 'grupo'
                        },
                        description: {
                            'en-US': 'The group to remove',
                            'es-ES': 'El grupo a eliminar'
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: groupChoices
                    }
                ]
            })

            // display
            moreAutorolesOptions.push({
                name: {
                    'en-US': 'display',
                    'es-ES': 'mostrar'
                },
                description: {
                    'en-US': 'Display the autorole group',
                    'es-ES': 'Mostrar el grupo de autoroles'
                },
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: {
                            'en-US': 'group',
                            'es-ES': 'grupo'
                        },
                        description: {
                            'en-US': 'The group to display',
                            'es-ES': 'El grupo a mostrar'
                        },
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: groupChoices
                    },
                    {
                        name: {
                            'en-US': 'channel',
                            'es-ES': 'canal'
                        },
                        description: {
                            'en-US': 'The channel to display the autorole group',
                            'es-ES': 'El canal para mostrar el grupo de autoroles'
                        },
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [0]
                    },
                    {
                        name: {
                            'en-US': 'message',
                            'es-ES': 'mensaje'
                        },
                        description: {
                            'en-US': 'The message to display the autorole group',
                            'es-ES': 'El mensaje para mostrar el grupo de autoroles'
                        },
                        type: ApplicationCommandOptionType.String
                    }
                ]
            })
        }
        this.addOption({
            name: {
                'en-US': 'autoroles',
                'es-ES': 'autoroles'
            },
            description: {
                'en-US': 'Config the autoroles',
                'es-ES': 'Configurar los autoroles'
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: moreAutorolesOptions
        })
    }

    async interacion(interaction: ChatInputCommandInteraction<'cached'>) {
        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup()
        import(`./config/${subcommandGroup}.js`).then(scg => scg[subcommand](interaction)).catch(console.error)
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const [, sub] = interaction.customId.split('_')
        if (sub === 'autoroll') this.autorollBtn(interaction)
    }

    async autorollBtn(interaction: ButtonInteraction<'cached'>) {
        const [, , rollId] = interaction.customId.split(/_/gi)
        const translate = Translator(interaction)
        if (interaction.member.roles.cache.has(rollId)) {
            interaction.member.roles.remove(rollId)
            interaction.reply({
                content: translate('config_cmd.autoroles.remove'),
                ephemeral: true
            })
        } else {
            interaction.member.roles.add(rollId)
            interaction.reply({
                content: translate('config_cmd.autoroles.add'),
                ephemeral: true
            })
        }
    }
}
