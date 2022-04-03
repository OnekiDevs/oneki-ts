import { ApplicationCommandDataResolvable, CommandInteraction, Guild, GuildMember, MessageEmbed, TextChannel } from 'discord.js'
import { Command, Client, CommandType, Server } from '../utils/classes.js'
import { Translator } from '../utils/utils.js'
import { checkSend } from '../utils/utils.js'

export default class Suggest extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'suggest',
            description: 'Make a suggestion',
            defaultPermission: true,
            type: CommandType.guild,
        })
    }

    async getData(guild: Guild): Promise<ApplicationCommandDataResolvable> {
        const server = this.client.getServer(guild)
        const command = this.baseCommand
        command.addStringOption((option) => option.setName('suggestion').setDescription('Suggest to send').setRequired(true))
        if (server && server.suggestChannels.length > 0) {
            const channels = server.suggestChannels.map((i) => [i.alias ?? 'predetermined', i.channel??i.channel_id])            
            command.addStringOption((option) =>
                option
                    .setName('channel')
                    .setDescription('channel to send the suggestion')
                    .addChoices(channels as [name: string, value: string][]),
            )
        }
        return command.toJSON() as ApplicationCommandDataResolvable
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    run(interaction: CommandInteraction<'cached'>): any {
        const translate = Translator(interaction)
        let server = this.client.servers.get(interaction.guildId as string)
        if (!server || server.suggestChannels.length === 0) {
            server = new Server(interaction.guild)
            interaction.reply({
                content: translate('suggest_cmd.whitout_channel'),
                ephemeral: true,
            })
            const guild = interaction.guild ?? this.client.guilds.cache.get(interaction.guildId as string)
            return (
                guild?.name,
                guild?.commands.cache.map((c) => {
                    if (c.name == interaction.commandName) c.delete()
                })
            )
        }
        const channelId = interaction.options.getString('channel')
        const sug = interaction.options.getString('suggestion')
        const channel = this.client.channels.cache.get(channelId as string) as TextChannel
        if (channel && checkSend(channel, interaction.guild?.me as GuildMember)) {
            server.lastSuggestId += 1
            const embed = new MessageEmbed()
                .setAuthor({
                    name:interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTitle(translate('suggest_cmd.title', { id:server?.lastSuggestId }))
                .setColor(16313844)
                .setDescription(sug as string)
                .setFooter({
                    text: translate('footer', { bot:this.client.user?.username, version:this.client.version }),
                    iconURL: this.client.user?.avatarURL() as string
                })
                .setTimestamp()
            channel
                .send({
                    embeds: [embed],
                })
                .then((msg) =>{ 
                    msg.startThread({
                        name: translate('suggest_cmd.sent', { id:server?.lastSuggestId }),
                    })
                    server?.db?.collection('suggests').doc(`suggest_${server.lastSuggestId}`).set({ 
                        author: interaction.user.id, 
                        channel: msg.channel.id,
                        suggest: sug
                    })
                }
                )
            return interaction.reply({ content: translate('suggest_cmd.sent'), ephemeral: true })
        } else if (checkSend(channel, interaction.guild?.me as GuildMember)) {
            return interaction.reply({
                content: translate('suggest_cmd.error_permissions', {channel, owner:'<#'+interaction.guild?.ownerId+'>'}),
                ephemeral: true,
            })
        } else if (!channelId || !channel) {
            server.removeSuggestChannel(channelId as string)
            return interaction.reply({ content: translate('suggest_cmd.missing_channel'), ephemeral: true })
            ;(interaction.client as Client).commands.get(interaction.commandName)?.deploy(interaction.guild as Guild)
            ;(interaction.client as Client).commands.get('config')?.deploy(interaction.guild as Guild)
        }
    }

    checkDeploy(guild?: Guild): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const server = this.client.servers.get(guild?.id as string)
            resolve((server && server.suggestChannels.length == 0) as boolean)
        })
    }
}
