import {
    ChatInputCommandInteraction,
    GuildMember,
    TextChannel,
    ApplicationCommandOptionType,
    ButtonInteraction,
    AutocompleteInteraction
} from 'discord.js'
import { Command } from '../utils/classes.js'
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
                },
                {
                    name: {
                        'en-US': 'channel',
                        'es-ES': 'canal'
                    },
                    type: ApplicationCommandOptionType.String,
                    description: {
                        'en-US': 'The channel where the suggestion will be sent',
                        'es-ES': 'El canal donde se enviará la sugerencia'
                    },
                    required: true,
                    autocomplete: true
                }
            ]
        })
    }

    async interaction(interaction: ChatInputCommandInteraction<'cached'>) {
        const translate = Translator(interaction)
        const server = client.getServer(interaction.guild)

        if (!server.suggestChannels.length)
            return interaction.reply({
                content: translate('suggest_cmd.whitout_channel'),
                ephemeral: true
            })

        const channelId = interaction.options.getString('channel') ?? server.suggestChannels[0].channel
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
        } else return
    }

    async button(interaction: ButtonInteraction<'cached'>): Promise<any> {
        const [, m, id] = interaction.customId.split(/_/gi)
        const server = client.getServer(interaction.guild)
        if (m === 'a') server.aceptSug(id)
        else server.rejectSug(id)
        return interaction.deferUpdate()
    }

    async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<any> {
        const server = client.getServer(interaction.guild)
        return interaction.respond(
            server.suggestChannels.map(c => ({
                name: c.default ? 'default' : c.alias!,
                value: c.channel
            }))
        )
    }
}
