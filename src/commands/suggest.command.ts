import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    EmbedBuilder,
    TextChannel,
    ApplicationCommandOptionType
} from 'discord.js'
import { Command, Client, Server } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'
import { checkSend } from '../utils/utils.js'

export default class Suggest extends Command {
    constructor(client: Client) {
        super(client, {
            name: {
                'en-US': 'suggest',
                'es-ES': 'sugerencia'
            },
            description: {
                'es-ES': 'Sugiere algo en el servidor',
                'en-US': 'Suggest something in the server'
            },
            global: false
        })
    }

    async createData(guild: Guild): Promise<void> {
        const server = this.client.getServer(guild)

        this.addOption({
            name: 'suggestion',
            type: ApplicationCommandOptionType.String,
            description: 'The suggestion',
            required: true
        })

        if (server.suggestChannels.length > 0) {
            const channels = server.suggestChannels.map(c => {
                return { name: c.alias ?? 'predetermined', value: c.channel }
            })

            this.addOption({
                name: 'channel',
                type: ApplicationCommandOptionType.String,
                description: 'The channel to send the suggestion',
                required: true,
                choices: channels
            })
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interacion(interaction: ChatInputCommandInteraction<'cached'>): any {
        const translate = Translator(interaction)
        let server = this.client.servers.get(interaction.guildId as string)
        if (!server || server.suggestChannels.length === 0) {
            server = new Server(interaction.guild)
            interaction.reply({
                content: translate('suggest_cmd.whitout_channel'),
                ephemeral: true
            })
            const guild = interaction.guild ?? this.client.guilds.cache.get(interaction.guildId as string)
            return (
                guild?.name,
                guild?.commands.cache.map(c => {
                    if (c.name == interaction.commandName) c.delete()
                })
            )
        }
        const channelId = interaction.options.getString('channel')
        const sug = interaction.options.getString('suggestion')
        const channel = this.client.channels.cache.get(channelId as string) as TextChannel
        if (channel && checkSend(channel, interaction.guild?.members.me as GuildMember)) {
            server.lastSuggestId += 1
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTitle(translate('suggest_cmd.title', { id: server?.lastSuggestId }))
                .setColor(16313844)
                .setDescription(sug as string)
                .setFooter({
                    text: translate('footer', { bot: this.client.user?.username, version: this.client.version }),
                    iconURL: this.client.user?.avatarURL() as string
                })
                .setTimestamp()
            channel
                .send({
                    embeds: [embed]
                })
                .then(msg => {
                    msg.startThread({
                        name: translate('suggest_cmd.sent', { id: server?.lastSuggestId })
                    })
                    server?.db?.collection('suggests').doc(`suggest_${server.lastSuggestId}`).set({
                        author: interaction.user.id,
                        channel: msg.channel.id,
                        suggest: sug
                    })
                })
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
            //;(interaction.client as Client).commands.get(interaction.commandName)?.deploy(interaction.guild as Guild)
            //;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild as Guild)
        }
    }

    checkDeploy(guild?: Guild): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const server = this.client.servers.get(guild?.id as string)
            resolve((server && server.suggestChannels.length == 0) as boolean)
        })
    }
}
