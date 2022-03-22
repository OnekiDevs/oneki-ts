/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationCommandDataResolvable, CommandInteraction, Guild } from 'discord.js'
import { Command, Client, CommandType, LangType } from '../utils/classes.js'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import fs from 'fs'

export default class Config extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'config',
            description: 'config',
            defaultPermission: false,
            type: CommandType.guild
        })
    }

    getData(guild?: Guild): Promise<ApplicationCommandDataResolvable> {
        const server = this.client.servers.get(guild?.id as string)
        const suggestChannelsChoices = server?.suggestChannels.map(c => {
            console.log(c)
            
            return [c.default ? 'default' : c.alias, c.channel]
        })
        const logs = ['message_update', 'message_delete', 'message_attachment']
        const subcommandsLogs = logs.map(i =>
            new SlashCommandSubcommandBuilder()
                .setName(i)
                .setDescription(`Config ${i} logs`)
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel where the logs are send')
                        .setRequired(true)
                        .addChannelType(0)
                )
        )

        const command = this.baseCommand

        command.addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('set') // group
                .setDescription('set configs')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('language') // command
                        .setDescription('Set language')
                        .addStringOption(option =>
                            option
                                .setName('lang') // option
                                .setDescription('Language')
                                .setRequired(true)
                                .addChoices([
                                    ['Español', LangType.es],
                                    ['English', LangType.en]
                                ])
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('prefix')
                        .setDescription('Set a new unique prefix')
                        .addStringOption(option =>
                            option.setName('prefix').setDescription('New prefix').setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('suggest_channel')
                        .setDescription('Set a unique suggest channel')
                        .addChannelOption(option =>
                            option
                                .setName('channel')
                                .setDescription('Channel where the suggest are sent')
                                .addChannelType(0)
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
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
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('birthday_message')
                        .setDescription('Change your happy birthday\'s announcement')
                        .addStringOption(option => 
                            option
                                .setName('message')
                                .setDescription('The message to use when sending the message')
                                .setRequired(true)
                        )
                )
        )

        command.addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('add')
                .setDescription('add config')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('prefix')
                        .setDescription('Add a new prefix to the bot')
                        .addStringOption(option =>
                            option.setName('prefix').setDescription('A new prefix').setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('suggest_channel')
                        .setDescription('Add a new suggest channel')
                        .addChannelOption(option =>
                            option
                                .setName('channel')
                                .setDescription('Channel to suggest')
                                .setRequired(true)
                                .addChannelType(0)
                        )
                        .addStringOption(option =>
                            option
                                .setName('alias')
                                .setDescription('Name to refired a suggest channel')
                                .setRequired(true)
                        )
                        .addBooleanOption(option =>
                            option.setName('default').setDescription('Set a default suggestion channel')
                        )
                )
        )

        command.addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('remove')
                .setDescription('remove config')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('prefix')
                        .setDescription('Remove prefix')
                        .addStringOption(option =>
                            option
                                .setName('prefix')
                                .setDescription('Prefix to remove')
                                .addChoices(
                                    server?.getPrefixes(true).map(i => [i, i]) ?? [
                                        ['>', '>'],
                                        ['?', '?']
                                    ]
                                )
                        )
                )
                .addSubcommand(subcommand => {
                    subcommand.setName('suggest_channel').setDescription('Remove suggestion channel')
                    if (suggestChannelsChoices && suggestChannelsChoices.length > 0)
                        subcommand.addStringOption(option =>
                            option
                                .setName('alias')
                                .setDescription('Alias of channel to remove')
                                .setRequired(true)
                                .addChoices(suggestChannelsChoices as [name: string, value: string][])
                        )
                    console.log(suggestChannelsChoices && suggestChannelsChoices.length > 0, suggestChannelsChoices, guild?.id)
                    
                    return subcommand
                })
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('log')
                        .setDescription('Remove log channel')
                        .addStringOption(option =>
                            option
                                .setName('logname')
                                .setDescription('Log name to remove')
                                .setRequired(true)
                                .addChoices(logs.map(l => [l, l]))
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('birthday_channel')
                        .setDescription('Remove the channel to celebrate user\'s birthdays')
                )
        )

        command.addSubcommandGroup(subcommandGroup => {
            subcommandGroup.setName('log').setDescription('Config the logs channels')
            for (const scl of subcommandsLogs) {
                subcommandGroup.addSubcommand(scl)
            }
            subcommandGroup.addSubcommand(subcommand =>
                subcommand
                    .setName('auto')
                    .setDescription('Configure logs automatically')
                    .addChannelOption(option => option.setName('category').setDescription('Category to use').addChannelType(4))
            )
            return subcommandGroup
        })

        command.addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('export')
                .setDescription('Export the config file')
                .addSubcommand(subcommand => subcommand.setName('file').setDescription('Export the config file'))
        )

        command.addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('import')
                .setDescription('Import the config file')
                .addSubcommand(subcommand => subcommand.setName('file').setDescription('Export the config file'))
        )

        const cmd = command.toJSON() as any
        const _ = cmd.options
            .find((o: { name: string }) => o.name === 'import')
            ?.options.find((o: { name: string }) => o.name === 'file')
        _.options = [
            {
                type: 11,
                name: 'json',
                description: 'Configuration json file',
                required: true
            }
        ]
        fs.writeFile('./config'+guild?.id+'.json', JSON.stringify(cmd, null, 4), ()=>'')
        // console.log(JSON.stringify(command.options?.[5].options, null, 1))
        return new Promise(resolve => resolve(cmd))
    }

    run(interaction: CommandInteraction) {
        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup()
        import(`./config/${subcommandGroup}.js`).then(scg => scg[subcommand](interaction)).catch(() => '')
    }
}
