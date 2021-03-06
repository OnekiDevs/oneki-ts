import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    TextChannel,
    ApplicationCommandOptionType,
    ButtonInteraction
    //Message
} from 'discord.js'
import { Command, Server } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'
import { checkSend } from '../utils/utils.js'
import client from '../client.js'

export default class Suggest extends Command {
    constructor() {
        super({
            name: {
                'en-US': 'suggest',
                'es-ES': 'sugerencia'
            },
            description: {
                'es-ES': 'Sugiere algo en el servidor',
                'en-US': 'Suggest something in the server'
            },
            options: [
                {
                    name: {
                        'en-US': 'suggestion',
                        'es-ES': 'sugerencia'
                    },
                    type: ApplicationCommandOptionType.String,
                    description: {
                        'en-US': 'The suggestion',
                        'es-ES': 'La sugerencia'
                    },
                    required: true
                }
            ],
            global: false
        })
    }

    async createData(guild: Guild) {
        const server = client.getServer(guild)

        const baseCommand = this.baseCommand

        //TODO: Add support for autocomplete
        if (server.suggestChannels.length > 0) {
            const channels = server.suggestChannels.map(c => {
                return {
                    name: { 'en-US': c.alias ?? 'predetermined', 'es-ES': c.alias ?? 'predeterminado' },
                    value: c.channel
                }
            })

            this.addOption(baseCommand, {
                name: {
                    'en-US': 'channel',
                    'es-ES': 'canal'
                },
                type: ApplicationCommandOptionType.String,
                description: {
                    'en-US': 'The channel where the suggestion will be sent',
                    'es-ES': 'El canal donde se enviar?? la sugerencia'
                },
                required: true,
                choices: channels
            })
        }

        return baseCommand
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interacion(interaction: ChatInputCommandInteraction<'cached'>): any {
        const translate = Translator(interaction)
        let server = client.servers.get(interaction.guildId as string)
        if (!server || server.suggestChannels.length === 0) {
            server = new Server(interaction.guild)
            interaction.reply({
                content: translate('suggest_cmd.whitout_channel'),
                ephemeral: true
            })
            const guild = interaction.guild ?? client.guilds.cache.get(interaction.guildId as string)
            return (
                guild?.name,
                guild?.commands.cache.map(c => {
                    if (c.name == interaction.commandName) c.delete()
                })
            )
        }
        const channelId = interaction.options.getString('channel') ?? server.suggestChannels[0].channel //change
        const channel = client.channels.cache.get(channelId as string) as TextChannel
        if (channel && checkSend(channel, interaction.guild?.members.me as GuildMember)) {
            server.sendSuggestion(interaction)
            return interaction.reply({ content: translate('suggest_cmd.sent'), ephemeral: true })
        } else if (checkSend(channel, interaction.guild?.members.me as GuildMember)) {
            return interaction.reply({
                content: translate('suggest_cmd.error_permissions', {
                    channel,
                    owner: '<#' + interaction.guild?.ownerId + '>'
                }),
                ephemeral: true
            })
        } else if (!channelId || !channel) {
            server.removeSuggestChannel(channelId as string)
            return interaction.reply({ content: translate('suggest_cmd.missing_channel'), ephemeral: true })
        }
    }

    checkDeploy(guild?: Guild): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const server = client.servers.get(guild?.id as string)
            resolve((server && server.suggestChannels.length == 0) as boolean)
        })
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const [, m, id] = interaction.customId.split(/_/gi)
        const server = client.getServer(interaction.guild)
        if (m === 'a') server.aceptSug(id)
        else server.rejectSug(id)
        interaction.deferUpdate()
    }
}
